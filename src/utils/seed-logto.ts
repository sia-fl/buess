import { ORIGINATION_ROLES, PERMISSIONS } from '@/services/data/permission';
import { VITE_BASE_URL } from '@/const';
import { facade } from './facade';
import { hashPassword, randomString } from './str';
import { DB } from 'kysely-codegen';
import path from 'path';
import fs from 'fs';
import * as process from 'node:process';

// Helper function to delete from table based on tenant_id, and exclude certain ids
async function deleteFromTable(tableName: keyof DB, excludeIds: string[] = []) {
  const q = facade.kysely.deleteFrom(tableName).where('tenant_id', '=', 'default');

  if (excludeIds.length > 0) {
    q.where('id', 'not in', excludeIds);
  }

  await q.execute();
}

async function cleanup() {
  await deleteFromTable('applications');
  await deleteFromTable('users');
  await deleteFromTable('organization_scopes');
  await deleteFromTable('resources', ['management-api']);
  await deleteFromTable('organization_roles');
  await deleteFromTable('organization_role_scope_relations');
  await deleteFromTable('organization_role_user_relations');
  await deleteFromTable('organizations');
  await deleteFromTable('organization_user_relations');
  console.log('Cleanup complete');
}

let buessAppId = '';

// Function to ensure the application exists
async function recreateApplication() {
  const appName = 'buess';
  const { id } = await facade.kysely
    .insertInto('applications')
    .values({
      tenant_id: 'default',
      id: randomString(21),
      name: appName,
      description: appName,
      secret: randomString(),
      type: 'SPA',
      oidc_client_metadata: {
        redirectUris: [`${VITE_BASE_URL}/callback`],
        postLogoutRedirectUris: [`${VITE_BASE_URL}/auth`],
      },
      custom_client_metadata: {},
      is_third_party: false,
      created_at: new Date(),
    })
    .returning('id')
    .executeTakeFirstOrThrow();
  buessAppId = id;
}

// Helper function to recreate users
async function recreateUsers() {
  await facade.kysely
    .insertInto('users')
    .values([
      {
        tenant_id: 'default',
        id: randomString(12),
        primary_email: 'justlikesuolong@outlook.com',
        primary_phone: '1234567890',
        username: 'suolong',
        name: 'suolong',
        password_encrypted: await hashPassword('a12345678'),
        password_encryption_method: 'Argon2i',
        profile: {},
        application_id: buessAppId,
        identities: {},
        custom_data: {},
        logto_config: {},
        is_suspended: false,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ])
    .execute();
}

// Helper function to insert permissions into organization_scopes
async function insertOrganizationScopes() {
  return facade.kysely
    .insertInto('organization_scopes')
    .values(
      PERMISSIONS.map((permission) => ({
        tenant_id: 'default',
        name: permission.name,
        description: permission.description,
        id: randomString(21),
      })),
    )
    .returning(['id', 'name'])
    .execute();
}

// Function to ensure the first resource exists and is set to default
async function recreateFirstResource() {
  const resourceName = 'buess';
  const resourceUri = 'https://buess.airco.cc';

  await facade.kysely
    .insertInto('resources')
    .values({
      tenant_id: 'default',
      id: randomString(20),
      name: resourceName,
      indicator: resourceUri,
      is_default: true,
      access_token_ttl: 3600,
    })
    .execute();
}

// Function to recreate origination roles and sync their scopes
async function recreateOriginationRoles() {
  const roles = await facade.kysely
    .insertInto('organization_roles')
    .values(
      ORIGINATION_ROLES.map((role) => ({
        tenant_id: 'default',
        name: role.name,
        description: role.description,
        id: randomString(21),
      })),
    )
    .returning(['id', 'name'])
    .execute();

  const roleScopes = await insertOrganizationScopes();

  await facade.kysely
    .insertInto('organization_role_scope_relations')
    .values(
      roleScopes.flatMap((scope) =>
        roles.map((role) => ({
          tenant_id: 'default',
          organization_role_id: role.id,
          organization_scope_id: scope.id,
        })),
      ),
    )
    .execute();
}

// Main function to execute all setup steps
async function setup() {
  try {
    await cleanup();
    await recreateApplication();
    await recreateUsers();
    await recreateFirstResource();
    await recreateOriginationRoles();
    // console.log('Setup complete');

    /**
     * 将 buessAppId 的值写入 .env 文件
     */
    const pathname = path.resolve(process.cwd(), '.env');
    const content = `VITE_LOGTO_APP_ID=${buessAppId}`;
    const envFile = fs.readFileSync(pathname, 'utf-8');
    const newEnvFile = envFile.replace(/VITE_LOGTO_APP_ID=.*/, content);
    fs.writeFileSync(pathname, newEnvFile);
    console.log(`Wrote buessAppId to .env: ${buessAppId}`);

    process.exit(0);
  } catch (error) {
    console.error('Setup failed:', error);
    process.exit(1);
  }
}

// Execute the setup function
// noinspection JSIgnoredPromiseFromCall
setup();