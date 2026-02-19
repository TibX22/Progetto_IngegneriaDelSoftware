import type { Schema, Struct } from '@strapi/strapi';

export interface AdminApiToken extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_api_tokens';
  info: {
    description: '';
    displayName: 'Api Token';
    name: 'Api Token';
    pluralName: 'api-tokens';
    singularName: 'api-token';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    accessKey: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    description: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }> &
      Schema.Attribute.DefaultTo<''>;
    encryptedKey: Schema.Attribute.Text &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    expiresAt: Schema.Attribute.DateTime;
    lastUsedAt: Schema.Attribute.DateTime;
    lifespan: Schema.Attribute.BigInteger;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'admin::api-token'> &
      Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    permissions: Schema.Attribute.Relation<
      'oneToMany',
      'admin::api-token-permission'
    >;
    publishedAt: Schema.Attribute.DateTime;
    type: Schema.Attribute.Enumeration<['read-only', 'full-access', 'custom']> &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'read-only'>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface AdminApiTokenPermission extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_api_token_permissions';
  info: {
    description: '';
    displayName: 'API Token Permission';
    name: 'API Token Permission';
    pluralName: 'api-token-permissions';
    singularName: 'api-token-permission';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'admin::api-token-permission'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    token: Schema.Attribute.Relation<'manyToOne', 'admin::api-token'>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface AdminAuditLog extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_audit_logs';
  info: {
    displayName: 'Audit Log';
    pluralName: 'audit-logs';
    singularName: 'audit-log';
  };
  options: {
    draftAndPublish: false;
    timestamps: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Schema.Attribute.String & Schema.Attribute.Required;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    date: Schema.Attribute.DateTime & Schema.Attribute.Required;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'admin::audit-log'> &
      Schema.Attribute.Private;
    payload: Schema.Attribute.JSON;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    user: Schema.Attribute.Relation<'oneToOne', 'admin::user'>;
  };
}

export interface AdminPermission extends Struct.CollectionTypeSchema {
  collectionName: 'admin_permissions';
  info: {
    description: '';
    displayName: 'Permission';
    name: 'Permission';
    pluralName: 'permissions';
    singularName: 'permission';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    actionParameters: Schema.Attribute.JSON & Schema.Attribute.DefaultTo<{}>;
    conditions: Schema.Attribute.JSON & Schema.Attribute.DefaultTo<[]>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'admin::permission'> &
      Schema.Attribute.Private;
    properties: Schema.Attribute.JSON & Schema.Attribute.DefaultTo<{}>;
    publishedAt: Schema.Attribute.DateTime;
    role: Schema.Attribute.Relation<'manyToOne', 'admin::role'>;
    subject: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface AdminRole extends Struct.CollectionTypeSchema {
  collectionName: 'admin_roles';
  info: {
    description: '';
    displayName: 'Role';
    name: 'Role';
    pluralName: 'roles';
    singularName: 'role';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    code: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    description: Schema.Attribute.String;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'admin::role'> &
      Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    permissions: Schema.Attribute.Relation<'oneToMany', 'admin::permission'>;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    users: Schema.Attribute.Relation<'manyToMany', 'admin::user'>;
  };
}

export interface AdminSession extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_sessions';
  info: {
    description: 'Session Manager storage';
    displayName: 'Session';
    name: 'Session';
    pluralName: 'sessions';
    singularName: 'session';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
    i18n: {
      localized: false;
    };
  };
  attributes: {
    absoluteExpiresAt: Schema.Attribute.DateTime & Schema.Attribute.Private;
    childId: Schema.Attribute.String & Schema.Attribute.Private;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    deviceId: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Private;
    expiresAt: Schema.Attribute.DateTime &
      Schema.Attribute.Required &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'admin::session'> &
      Schema.Attribute.Private;
    origin: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    sessionId: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Private &
      Schema.Attribute.Unique;
    status: Schema.Attribute.String & Schema.Attribute.Private;
    type: Schema.Attribute.String & Schema.Attribute.Private;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    userId: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Private;
  };
}

export interface AdminTransferToken extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_transfer_tokens';
  info: {
    description: '';
    displayName: 'Transfer Token';
    name: 'Transfer Token';
    pluralName: 'transfer-tokens';
    singularName: 'transfer-token';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    accessKey: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    description: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }> &
      Schema.Attribute.DefaultTo<''>;
    expiresAt: Schema.Attribute.DateTime;
    lastUsedAt: Schema.Attribute.DateTime;
    lifespan: Schema.Attribute.BigInteger;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'admin::transfer-token'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    permissions: Schema.Attribute.Relation<
      'oneToMany',
      'admin::transfer-token-permission'
    >;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface AdminTransferTokenPermission
  extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_transfer_token_permissions';
  info: {
    description: '';
    displayName: 'Transfer Token Permission';
    name: 'Transfer Token Permission';
    pluralName: 'transfer-token-permissions';
    singularName: 'transfer-token-permission';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'admin::transfer-token-permission'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    token: Schema.Attribute.Relation<'manyToOne', 'admin::transfer-token'>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface AdminUser extends Struct.CollectionTypeSchema {
  collectionName: 'admin_users';
  info: {
    description: '';
    displayName: 'User';
    name: 'User';
    pluralName: 'users';
    singularName: 'user';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    blocked: Schema.Attribute.Boolean &
      Schema.Attribute.Private &
      Schema.Attribute.DefaultTo<false>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    email: Schema.Attribute.Email &
      Schema.Attribute.Required &
      Schema.Attribute.Private &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    firstname: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    isActive: Schema.Attribute.Boolean &
      Schema.Attribute.Private &
      Schema.Attribute.DefaultTo<false>;
    lastname: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'admin::user'> &
      Schema.Attribute.Private;
    password: Schema.Attribute.Password &
      Schema.Attribute.Private &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    preferedLanguage: Schema.Attribute.String;
    publishedAt: Schema.Attribute.DateTime;
    registrationToken: Schema.Attribute.String & Schema.Attribute.Private;
    resetPasswordToken: Schema.Attribute.String & Schema.Attribute.Private;
    roles: Schema.Attribute.Relation<'manyToMany', 'admin::role'> &
      Schema.Attribute.Private;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    username: Schema.Attribute.String;
  };
}

export interface ApiArchivioMaterialiArchivioMateriali
  extends Struct.CollectionTypeSchema {
  collectionName: 'archivio_materialis';
  info: {
    description: '';
    displayName: 'ArchivioMateriali';
    pluralName: 'archivio-materialis';
    singularName: 'archivio-materiali';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    dataCreazione: Schema.Attribute.DateTime;
    descrizione: Schema.Attribute.Text;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::archivio-materiali.archivio-materiali'
    > &
      Schema.Attribute.Private;
    materiale_on_boardings: Schema.Attribute.Relation<
      'oneToMany',
      'api::materiale-on-boarding.materiale-on-boarding'
    >;
    nome: Schema.Attribute.String;
    profilo_azienda: Schema.Attribute.Relation<
      'oneToOne',
      'api::profilo-azienda.profilo-azienda'
    >;
    profilo_candidato: Schema.Attribute.Relation<
      'oneToOne',
      'api::profilo-candidato.profilo-candidato'
    >;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiAziendaAzienda extends Struct.CollectionTypeSchema {
  collectionName: 'aziendas';
  info: {
    description: '';
    displayName: 'Azienda';
    pluralName: 'aziendas';
    singularName: 'azienda';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    colloquios: Schema.Attribute.Relation<
      'manyToMany',
      'api::colloquio.colloquio'
    >;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    feedbacks: Schema.Attribute.Relation<'oneToMany', 'api::feedback.feedback'>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::azienda.azienda'
    > &
      Schema.Attribute.Private;
    messaggios: Schema.Attribute.Relation<
      'manyToMany',
      'api::messaggio.messaggio'
    >;
    offerta_lavoros: Schema.Attribute.Relation<
      'oneToMany',
      'api::offerta-lavoro.offerta-lavoro'
    >;
    profilo_azienda: Schema.Attribute.Relation<
      'oneToOne',
      'api::profilo-azienda.profilo-azienda'
    >;
    publishedAt: Schema.Attribute.DateTime;
    risultato_test: Schema.Attribute.Relation<
      'oneToOne',
      'api::risultato-test.risultato-test'
    >;
    tests: Schema.Attribute.Relation<'oneToMany', 'api::test.test'>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    user: Schema.Attribute.Relation<
      'oneToOne',
      'plugin::users-permissions.user'
    >;
  };
}

export interface ApiBadgeBadge extends Struct.CollectionTypeSchema {
  collectionName: 'badges';
  info: {
    description: '';
    displayName: 'Badge';
    pluralName: 'badges';
    singularName: 'badge';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    descrizione: Schema.Attribute.Text;
    immagine: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'api::badge.badge'> &
      Schema.Attribute.Private;
    nome: Schema.Attribute.String;
    profilo_candidato: Schema.Attribute.Relation<
      'manyToOne',
      'api::profilo-candidato.profilo-candidato'
    >;
    publishedAt: Schema.Attribute.DateTime;
    requisito_posizione: Schema.Attribute.Relation<
      'manyToOne',
      'api::requisito-posizione.requisito-posizione'
    >;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiCandidatoCandidato extends Struct.CollectionTypeSchema {
  collectionName: 'candidatoes';
  info: {
    description: '';
    displayName: 'Candidato';
    pluralName: 'candidatoes';
    singularName: 'candidato';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    candidaturas: Schema.Attribute.Relation<
      'oneToMany',
      'api::candidatura.candidatura'
    >;
    colloquios: Schema.Attribute.Relation<
      'manyToMany',
      'api::colloquio.colloquio'
    >;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::candidato.candidato'
    > &
      Schema.Attribute.Private;
    messaggios: Schema.Attribute.Relation<
      'manyToMany',
      'api::messaggio.messaggio'
    >;
    offerta_lavoros: Schema.Attribute.Relation<
      'oneToMany',
      'api::offerta-lavoro.offerta-lavoro'
    >;
    offerte_salvates: Schema.Attribute.Relation<
      'oneToMany',
      'api::offerte-salvate.offerte-salvate'
    >;
    profilo_candidato: Schema.Attribute.Relation<
      'oneToOne',
      'api::profilo-candidato.profilo-candidato'
    >;
    publishedAt: Schema.Attribute.DateTime;
    tracciamento_fruiziones: Schema.Attribute.Relation<
      'oneToMany',
      'api::tracciamento-fruizione.tracciamento-fruizione'
    >;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    user: Schema.Attribute.Relation<
      'oneToOne',
      'plugin::users-permissions.user'
    >;
  };
}

export interface ApiCandidaturaCandidatura extends Struct.CollectionTypeSchema {
  collectionName: 'candidaturas';
  info: {
    description: '';
    displayName: 'Candidatura';
    pluralName: 'candidaturas';
    singularName: 'candidatura';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    candidato: Schema.Attribute.Relation<
      'manyToOne',
      'api::candidato.candidato'
    >;
    colloquios: Schema.Attribute.Relation<
      'manyToMany',
      'api::colloquio.colloquio'
    >;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    dataInvio: Schema.Attribute.DateTime;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::candidatura.candidatura'
    > &
      Schema.Attribute.Private;
    messaggioMotivazionale: Schema.Attribute.Text;
    offerta_lavoros: Schema.Attribute.Relation<
      'manyToMany',
      'api::offerta-lavoro.offerta-lavoro'
    >;
    publishedAt: Schema.Attribute.DateTime;
    stato: Schema.Attribute.Enumeration<
      ['Inviata', 'In revisione', 'Accettata', 'Rifiutata', 'Archiviata']
    >;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiCertificazioneCertificazione
  extends Struct.CollectionTypeSchema {
  collectionName: 'certificaziones';
  info: {
    description: '';
    displayName: 'Certificazione';
    pluralName: 'certificaziones';
    singularName: 'certificazione';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    dataRilascio: Schema.Attribute.Date;
    dataScadenza: Schema.Attribute.Date;
    enteRilascio: Schema.Attribute.String;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::certificazione.certificazione'
    > &
      Schema.Attribute.Private;
    nome: Schema.Attribute.String;
    profilo_candidato: Schema.Attribute.Relation<
      'manyToOne',
      'api::profilo-candidato.profilo-candidato'
    >;
    publishedAt: Schema.Attribute.DateTime;
    requisito_posizione: Schema.Attribute.Relation<
      'manyToOne',
      'api::requisito-posizione.requisito-posizione'
    >;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiColloquioColloquio extends Struct.CollectionTypeSchema {
  collectionName: 'colloquios';
  info: {
    description: '';
    displayName: 'Colloquio';
    pluralName: 'colloquios';
    singularName: 'colloquio';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    aziendas: Schema.Attribute.Relation<'manyToMany', 'api::azienda.azienda'>;
    candidatoes: Schema.Attribute.Relation<
      'manyToMany',
      'api::candidato.candidato'
    >;
    candidaturas: Schema.Attribute.Relation<
      'manyToMany',
      'api::candidatura.candidatura'
    >;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    dataOra: Schema.Attribute.DateTime;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::colloquio.colloquio'
    > &
      Schema.Attribute.Private;
    luogo: Schema.Attribute.String;
    messaggios: Schema.Attribute.Relation<
      'oneToMany',
      'api::messaggio.messaggio'
    >;
    modalita: Schema.Attribute.Enumeration<
      ['videochiamata', 'telefonata', 'presenza']
    >;
    publishedAt: Schema.Attribute.DateTime;
    statoColloquio: Schema.Attribute.Enumeration<
      ['in corso', 'programmato', 'reinviato']
    >;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiDomandaDomanda extends Struct.CollectionTypeSchema {
  collectionName: 'domandas';
  info: {
    description: '';
    displayName: 'Domanda';
    pluralName: 'domandas';
    singularName: 'domanda';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::domanda.domanda'
    > &
      Schema.Attribute.Private;
    opzioniRisposta: Schema.Attribute.String;
    publishedAt: Schema.Attribute.DateTime;
    punteggioMax: Schema.Attribute.Integer;
    test: Schema.Attribute.Relation<'manyToOne', 'api::test.test'>;
    testo: Schema.Attribute.Text;
    tipo: Schema.Attribute.Enumeration<
      ['RISPOSTA MULTIPLA', 'RISPOSTA APERTA']
    >;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiFeedbackFeedback extends Struct.CollectionTypeSchema {
  collectionName: 'feedbacks';
  info: {
    description: '';
    displayName: 'Feedback';
    pluralName: 'feedbacks';
    singularName: 'feedback';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    azienda: Schema.Attribute.Relation<'manyToOne', 'api::azienda.azienda'>;
    commento: Schema.Attribute.Text;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    dataInserita: Schema.Attribute.Date;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::feedback.feedback'
    > &
      Schema.Attribute.Private;
    profilo_candidato: Schema.Attribute.Relation<
      'manyToOne',
      'api::profilo-candidato.profilo-candidato'
    >;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    valutazione: Schema.Attribute.Integer;
  };
}

export interface ApiMaterialeOnBoardingMaterialeOnBoarding
  extends Struct.CollectionTypeSchema {
  collectionName: 'materiale_on_boardings';
  info: {
    description: '';
    displayName: 'MaterialeOnBoarding';
    pluralName: 'materiale-on-boardings';
    singularName: 'materiale-on-boarding';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    archivio_materiali: Schema.Attribute.Relation<
      'manyToOne',
      'api::archivio-materiali.archivio-materiali'
    >;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    dataCaricamento: Schema.Attribute.DateTime;
    descrizione: Schema.Attribute.Text;
    dimensioneFile: Schema.Attribute.Decimal;
    durataStimata: Schema.Attribute.Decimal;
    keywords: Schema.Attribute.String;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::materiale-on-boarding.materiale-on-boarding'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    tipoMateriale: Schema.Attribute.Enumeration<
      ['Preparazione al colloquio', 'Test recenti', 'Esercizi codice']
    >;
    titolo: Schema.Attribute.String;
    tracciamento_fruizione: Schema.Attribute.Relation<
      'manyToOne',
      'api::tracciamento-fruizione.tracciamento-fruizione'
    >;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    url: Schema.Attribute.String;
  };
}

export interface ApiMessaggioMessaggio extends Struct.CollectionTypeSchema {
  collectionName: 'messaggios';
  info: {
    description: '';
    displayName: 'Messaggio';
    pluralName: 'messaggios';
    singularName: 'messaggio';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    aziendas: Schema.Attribute.Relation<'manyToMany', 'api::azienda.azienda'>;
    candidatoes: Schema.Attribute.Relation<
      'manyToMany',
      'api::candidato.candidato'
    >;
    colloquio: Schema.Attribute.Relation<
      'manyToOne',
      'api::colloquio.colloquio'
    >;
    contenuto: Schema.Attribute.Text;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    dataOraInvio: Schema.Attribute.DateTime;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::messaggio.messaggio'
    > &
      Schema.Attribute.Private;
    oggetto: Schema.Attribute.Text;
    publishedAt: Schema.Attribute.DateTime;
    statoMessaggio: Schema.Attribute.Enumeration<
      ['inviato', 'letto', 'in invio']
    >;
    tipoMessaggio: Schema.Attribute.String;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiMotoreCompatibilitaMotoreCompatibilita
  extends Struct.CollectionTypeSchema {
  collectionName: 'motore_compatibilitas';
  info: {
    description: '';
    displayName: 'MotoreCompatibilit\u00E0';
    pluralName: 'motore-compatibilitas';
    singularName: 'motore-compatibilita';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    dataCalcolo: Schema.Attribute.DateTime;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::motore-compatibilita.motore-compatibilita'
    > &
      Schema.Attribute.Private;
    offerta_lavoro: Schema.Attribute.Relation<
      'oneToOne',
      'api::offerta-lavoro.offerta-lavoro'
    >;
    percentualeCompatibilita: Schema.Attribute.Decimal;
    profilo_azienda: Schema.Attribute.Relation<
      'oneToOne',
      'api::profilo-azienda.profilo-azienda'
    >;
    profilo_candidato: Schema.Attribute.Relation<
      'oneToOne',
      'api::profilo-candidato.profilo-candidato'
    >;
    publishedAt: Schema.Attribute.DateTime;
    requisito_posizione: Schema.Attribute.Relation<
      'oneToOne',
      'api::requisito-posizione.requisito-posizione'
    >;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiObiettivoCarrieraObiettivoCarriera
  extends Struct.CollectionTypeSchema {
  collectionName: 'obiettivo_carrieras';
  info: {
    description: '';
    displayName: 'ObiettivoCarriera';
    pluralName: 'obiettivo-carrieras';
    singularName: 'obiettivo-carriera';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::obiettivo-carriera.obiettivo-carriera'
    > &
      Schema.Attribute.Private;
    profilo_candidato: Schema.Attribute.Relation<
      'oneToOne',
      'api::profilo-candidato.profilo-candidato'
    >;
    publishedAt: Schema.Attribute.DateTime;
    ruoloDesiderato: Schema.Attribute.String;
    salarioDesiderato: Schema.Attribute.String;
    sedeDesiderata: Schema.Attribute.String;
    settoreDesiderato: Schema.Attribute.String;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiOffertaLavoroOffertaLavoro
  extends Struct.CollectionTypeSchema {
  collectionName: 'offerta_lavoros';
  info: {
    description: '';
    displayName: 'OffertaLavoro';
    pluralName: 'offerta-lavoros';
    singularName: 'offerta-lavoro';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    azienda: Schema.Attribute.Relation<'manyToOne', 'api::azienda.azienda'>;
    benefict: Schema.Attribute.Text;
    candidato: Schema.Attribute.Relation<
      'manyToOne',
      'api::candidato.candidato'
    >;
    candidaturas: Schema.Attribute.Relation<
      'manyToMany',
      'api::candidatura.candidatura'
    >;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    data_pubblicazione: Schema.Attribute.DateTime;
    descrizione: Schema.Attribute.Text;
    esperienza_richiesta: Schema.Attribute.Enumeration<
      ['anni 1-2', 'anni 3-5 ', 'anni 5-9 ', 'anni 10+ ']
    >;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localita: Schema.Attribute.String;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::offerta-lavoro.offerta-lavoro'
    > &
      Schema.Attribute.Private;
    modalita_lavoro: Schema.Attribute.Enumeration<
      ['ibrido', 'da remoto', 'in sede']
    >;
    offerte_salvates: Schema.Attribute.Relation<
      'oneToMany',
      'api::offerte-salvate.offerte-salvate'
    >;
    publishedAt: Schema.Attribute.DateTime;
    requisito_posiziones: Schema.Attribute.Relation<
      'oneToMany',
      'api::requisito-posizione.requisito-posizione'
    >;
    retribuzione_massima: Schema.Attribute.BigInteger;
    retribuzione_minima: Schema.Attribute.BigInteger;
    scadenza: Schema.Attribute.Date;
    settore: Schema.Attribute.Enumeration<
      [
        'Sviluppo Software',
        'Sviluppo Mobile',
        'DevOps & Cloud Computing',
        'Cybersecurity',
        'Data Science & Big Data',
        'Machine Learning & AI',
        'Blockchain & Cryptocurrency',
        'IT Support & System Administration',
        'QA & Testing',
        'UI/UX Design',
      ]
    >;
    tipo_contratto: Schema.Attribute.Enumeration<
      ['determinato', 'indeterminato']
    >;
    titolo: Schema.Attribute.String;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiOfferteSalvateOfferteSalvate
  extends Struct.CollectionTypeSchema {
  collectionName: 'offerte_salvates';
  info: {
    displayName: 'OfferteSalvate';
    pluralName: 'offerte-salvates';
    singularName: 'offerte-salvate';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    candidato: Schema.Attribute.Relation<
      'manyToOne',
      'api::candidato.candidato'
    >;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    dataSalvataggio: Schema.Attribute.DateTime;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::offerte-salvate.offerte-salvate'
    > &
      Schema.Attribute.Private;
    offerta_lavoro: Schema.Attribute.Relation<
      'manyToOne',
      'api::offerta-lavoro.offerta-lavoro'
    >;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiProfiloAziendaProfiloAzienda
  extends Struct.CollectionTypeSchema {
  collectionName: 'profilo_aziendas';
  info: {
    description: '';
    displayName: 'ProfiloAzienda';
    pluralName: 'profilo-aziendas';
    singularName: 'profilo-azienda';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    ambienteLavoro: Schema.Attribute.String;
    archivio_materiali: Schema.Attribute.Relation<
      'oneToOne',
      'api::archivio-materiali.archivio-materiali'
    >;
    azienda: Schema.Attribute.Relation<'oneToOne', 'api::azienda.azienda'>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    descrizione: Schema.Attribute.Text;
    emailContatto: Schema.Attribute.Email;
    focusCrescitaDipendenti: Schema.Attribute.Boolean;
    focusSostenibilita: Schema.Attribute.Boolean;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::profilo-azienda.profilo-azienda'
    > &
      Schema.Attribute.Private;
    nomeAzienda: Schema.Attribute.String;
    partitaIva: Schema.Attribute.String;
    publishedAt: Schema.Attribute.DateTime;
    sede: Schema.Attribute.String;
    settore: Schema.Attribute.String;
    sitoweb: Schema.Attribute.String;
    stileLeadership: Schema.Attribute.Enumeration<
      ['partecipativo', 'gerarchico', 'autonomo']
    >;
    telefono: Schema.Attribute.String;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    valoriCulturali: Schema.Attribute.Enumeration<
      ['innovazione', 'flessibilit\u00E0', 'collaborazione', 'meritocrazia']
    >;
  };
}

export interface ApiProfiloCandidatoProfiloCandidato
  extends Struct.CollectionTypeSchema {
  collectionName: 'profilo_candidatoes';
  info: {
    description: '';
    displayName: 'ProfiloCandidato';
    pluralName: 'profilo-candidatoes';
    singularName: 'profilo-candidato';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    badges: Schema.Attribute.Relation<'oneToMany', 'api::badge.badge'>;
    candidato: Schema.Attribute.Relation<
      'oneToOne',
      'api::candidato.candidato'
    >;
    certificaziones: Schema.Attribute.Relation<
      'oneToMany',
      'api::certificazione.certificazione'
    >;
    cognome: Schema.Attribute.String;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    CV: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios', true>;
    feedbacks: Schema.Attribute.Relation<'oneToMany', 'api::feedback.feedback'>;
    importanzaCrescitaPersonale: Schema.Attribute.Boolean;
    importanzaSostenibilita: Schema.Attribute.Boolean;
    indirizzo: Schema.Attribute.String;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::profilo-candidato.profilo-candidato'
    > &
      Schema.Attribute.Private;
    nome: Schema.Attribute.String;
    obiettivo_carriera: Schema.Attribute.Relation<
      'oneToOne',
      'api::obiettivo-carriera.obiettivo-carriera'
    >;
    preferenzaStileLeadeship: Schema.Attribute.Enumeration<
      ['partecipativo', 'gerarchico', 'autonomo']
    >;
    preferenzaValoriCulturali: Schema.Attribute.Enumeration<
      ['collaborazione', 'innovazione', 'meritocrazia']
    >;
    publishedAt: Schema.Attribute.DateTime;
    requisito_posiziones: Schema.Attribute.Relation<
      'oneToMany',
      'api::requisito-posizione.requisito-posizione'
    >;
    telefono: Schema.Attribute.String;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiRequisitoPosizioneRequisitoPosizione
  extends Struct.CollectionTypeSchema {
  collectionName: 'requisito_posiziones';
  info: {
    description: '';
    displayName: 'RequisitoPosizione';
    pluralName: 'requisito-posiziones';
    singularName: 'requisito-posizione';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    badges: Schema.Attribute.Relation<'oneToMany', 'api::badge.badge'>;
    certificaziones: Schema.Attribute.Relation<
      'oneToMany',
      'api::certificazione.certificazione'
    >;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    descrizione: Schema.Attribute.Text;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::requisito-posizione.requisito-posizione'
    > &
      Schema.Attribute.Private;
    nomeRequisito: Schema.Attribute.String;
    obbligatorio: Schema.Attribute.Boolean;
    offerta_lavoro: Schema.Attribute.Relation<
      'manyToOne',
      'api::offerta-lavoro.offerta-lavoro'
    >;
    pesoCalcolo: Schema.Attribute.Integer;
    profilo_candidato: Schema.Attribute.Relation<
      'manyToOne',
      'api::profilo-candidato.profilo-candidato'
    >;
    publishedAt: Schema.Attribute.DateTime;
    tipoRequisito: Schema.Attribute.Enumeration<
      [
        'COMPETENZA TECNICA',
        'SOFT SKILL',
        'LINGUA',
        'CERTIFICAZIONE',
        'BADGE',
        'ESPERIENZA',
        'TITOLO_STUDIO',
        'DISPONIBILITA',
      ]
    >;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    valoreRequisito: Schema.Attribute.Integer;
  };
}

export interface ApiRisultatoTestRisultatoTest
  extends Struct.CollectionTypeSchema {
  collectionName: 'risultato_tests';
  info: {
    description: '';
    displayName: 'RisultatoTest';
    pluralName: 'risultato-tests';
    singularName: 'risultato-test';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    azienda: Schema.Attribute.Relation<'oneToOne', 'api::azienda.azienda'>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    dataSostenimento: Schema.Attribute.DateTime;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::risultato-test.risultato-test'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    punteggioOttenuto: Schema.Attribute.Integer;
    risposteDate: Schema.Attribute.Text;
    superato: Schema.Attribute.Boolean;
    test: Schema.Attribute.Relation<'oneToOne', 'api::test.test'>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiTestTest extends Struct.CollectionTypeSchema {
  collectionName: 'tests';
  info: {
    description: '';
    displayName: 'Test';
    pluralName: 'tests';
    singularName: 'test';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    attivo: Schema.Attribute.Boolean;
    azienda: Schema.Attribute.Relation<'manyToOne', 'api::azienda.azienda'>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    descrizione: Schema.Attribute.Text;
    domandas: Schema.Attribute.Relation<'oneToMany', 'api::domanda.domanda'>;
    durataMassimaMinuti: Schema.Attribute.Integer;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'api::test.test'> &
      Schema.Attribute.Private;
    nome: Schema.Attribute.String;
    publishedAt: Schema.Attribute.DateTime;
    punteggioMinimo: Schema.Attribute.Integer;
    risultato_test: Schema.Attribute.Relation<
      'oneToOne',
      'api::risultato-test.risultato-test'
    >;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiTracciamentoFruizioneTracciamentoFruizione
  extends Struct.CollectionTypeSchema {
  collectionName: 'tracciamento_fruiziones';
  info: {
    description: '';
    displayName: 'TracciamentoFruizione';
    pluralName: 'tracciamento-fruiziones';
    singularName: 'tracciamento-fruizione';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    candidato: Schema.Attribute.Relation<
      'manyToOne',
      'api::candidato.candidato'
    >;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    dataFine: Schema.Attribute.DateTime;
    dataInizio: Schema.Attribute.DateTime;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::tracciamento-fruizione.tracciamento-fruizione'
    > &
      Schema.Attribute.Private;
    materiale_on_boardings: Schema.Attribute.Relation<
      'oneToMany',
      'api::materiale-on-boarding.materiale-on-boarding'
    >;
    progresso: Schema.Attribute.Decimal;
    publishedAt: Schema.Attribute.DateTime;
    stato: Schema.Attribute.Enumeration<
      ['IN SOSPESO', 'COMPLETATO', 'DA INIZIARE']
    >;
    tempoSpeso: Schema.Attribute.Time;
    ultimoAccesso: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface PluginContentReleasesRelease
  extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_releases';
  info: {
    displayName: 'Release';
    pluralName: 'releases';
    singularName: 'release';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    actions: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::content-releases.release-action'
    >;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::content-releases.release'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    publishedAt: Schema.Attribute.DateTime;
    releasedAt: Schema.Attribute.DateTime;
    scheduledAt: Schema.Attribute.DateTime;
    status: Schema.Attribute.Enumeration<
      ['ready', 'blocked', 'failed', 'done', 'empty']
    > &
      Schema.Attribute.Required;
    timezone: Schema.Attribute.String;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface PluginContentReleasesReleaseAction
  extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_release_actions';
  info: {
    displayName: 'Release Action';
    pluralName: 'release-actions';
    singularName: 'release-action';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    contentType: Schema.Attribute.String & Schema.Attribute.Required;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    entryDocumentId: Schema.Attribute.String;
    isEntryValid: Schema.Attribute.Boolean;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::content-releases.release-action'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    release: Schema.Attribute.Relation<
      'manyToOne',
      'plugin::content-releases.release'
    >;
    type: Schema.Attribute.Enumeration<['publish', 'unpublish']> &
      Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface PluginI18NLocale extends Struct.CollectionTypeSchema {
  collectionName: 'i18n_locale';
  info: {
    collectionName: 'locales';
    description: '';
    displayName: 'Locale';
    pluralName: 'locales';
    singularName: 'locale';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    code: Schema.Attribute.String & Schema.Attribute.Unique;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::i18n.locale'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.SetMinMax<
        {
          max: 50;
          min: 1;
        },
        number
      >;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface PluginReviewWorkflowsWorkflow
  extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_workflows';
  info: {
    description: '';
    displayName: 'Workflow';
    name: 'Workflow';
    pluralName: 'workflows';
    singularName: 'workflow';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    contentTypes: Schema.Attribute.JSON &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'[]'>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::review-workflows.workflow'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique;
    publishedAt: Schema.Attribute.DateTime;
    stageRequiredToPublish: Schema.Attribute.Relation<
      'oneToOne',
      'plugin::review-workflows.workflow-stage'
    >;
    stages: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::review-workflows.workflow-stage'
    >;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface PluginReviewWorkflowsWorkflowStage
  extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_workflows_stages';
  info: {
    description: '';
    displayName: 'Stages';
    name: 'Workflow Stage';
    pluralName: 'workflow-stages';
    singularName: 'workflow-stage';
  };
  options: {
    draftAndPublish: false;
    version: '1.1.0';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    color: Schema.Attribute.String & Schema.Attribute.DefaultTo<'#4945FF'>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::review-workflows.workflow-stage'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String;
    permissions: Schema.Attribute.Relation<'manyToMany', 'admin::permission'>;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    workflow: Schema.Attribute.Relation<
      'manyToOne',
      'plugin::review-workflows.workflow'
    >;
  };
}

export interface PluginUploadFile extends Struct.CollectionTypeSchema {
  collectionName: 'files';
  info: {
    description: '';
    displayName: 'File';
    pluralName: 'files';
    singularName: 'file';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    alternativeText: Schema.Attribute.Text;
    caption: Schema.Attribute.Text;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    ext: Schema.Attribute.String;
    focalPoint: Schema.Attribute.JSON;
    folder: Schema.Attribute.Relation<'manyToOne', 'plugin::upload.folder'> &
      Schema.Attribute.Private;
    folderPath: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Private &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    formats: Schema.Attribute.JSON;
    hash: Schema.Attribute.String & Schema.Attribute.Required;
    height: Schema.Attribute.Integer;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::upload.file'
    > &
      Schema.Attribute.Private;
    mime: Schema.Attribute.String & Schema.Attribute.Required;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    previewUrl: Schema.Attribute.Text;
    provider: Schema.Attribute.String & Schema.Attribute.Required;
    provider_metadata: Schema.Attribute.JSON;
    publishedAt: Schema.Attribute.DateTime;
    related: Schema.Attribute.Relation<'morphToMany'>;
    size: Schema.Attribute.Decimal & Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    url: Schema.Attribute.Text & Schema.Attribute.Required;
    width: Schema.Attribute.Integer;
  };
}

export interface PluginUploadFolder extends Struct.CollectionTypeSchema {
  collectionName: 'upload_folders';
  info: {
    displayName: 'Folder';
    pluralName: 'folders';
    singularName: 'folder';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    children: Schema.Attribute.Relation<'oneToMany', 'plugin::upload.folder'>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    files: Schema.Attribute.Relation<'oneToMany', 'plugin::upload.file'>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::upload.folder'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    parent: Schema.Attribute.Relation<'manyToOne', 'plugin::upload.folder'>;
    path: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    pathId: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.Unique;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface PluginUsersPermissionsPermission
  extends Struct.CollectionTypeSchema {
  collectionName: 'up_permissions';
  info: {
    description: '';
    displayName: 'Permission';
    name: 'permission';
    pluralName: 'permissions';
    singularName: 'permission';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Schema.Attribute.String & Schema.Attribute.Required;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::users-permissions.permission'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    role: Schema.Attribute.Relation<
      'manyToOne',
      'plugin::users-permissions.role'
    >;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface PluginUsersPermissionsRole
  extends Struct.CollectionTypeSchema {
  collectionName: 'up_roles';
  info: {
    description: '';
    displayName: 'Role';
    name: 'role';
    pluralName: 'roles';
    singularName: 'role';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    description: Schema.Attribute.String;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::users-permissions.role'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 3;
      }>;
    permissions: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::users-permissions.permission'
    >;
    publishedAt: Schema.Attribute.DateTime;
    type: Schema.Attribute.String & Schema.Attribute.Unique;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    users: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::users-permissions.user'
    >;
  };
}

export interface PluginUsersPermissionsUser
  extends Struct.CollectionTypeSchema {
  collectionName: 'up_users';
  info: {
    description: '';
    displayName: 'User';
    name: 'user';
    pluralName: 'users';
    singularName: 'user';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    azienda: Schema.Attribute.Relation<'oneToOne', 'api::azienda.azienda'>;
    blocked: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    candidato: Schema.Attribute.Relation<
      'oneToOne',
      'api::candidato.candidato'
    >;
    confirmationToken: Schema.Attribute.String & Schema.Attribute.Private;
    confirmed: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    dataCreazione: Schema.Attribute.DateTime;
    email: Schema.Attribute.Email &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::users-permissions.user'
    > &
      Schema.Attribute.Private;
    password: Schema.Attribute.Password &
      Schema.Attribute.Private &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    profiloCompleto: Schema.Attribute.Boolean;
    provider: Schema.Attribute.String;
    publishedAt: Schema.Attribute.DateTime;
    resetPasswordToken: Schema.Attribute.String & Schema.Attribute.Private;
    role: Schema.Attribute.Relation<
      'manyToOne',
      'plugin::users-permissions.role'
    >;
    Ruolo: Schema.Attribute.Enumeration<['Azienda', 'Candidato']>;
    stato: Schema.Attribute.Enumeration<['attivo', 'sospeso', 'in attesa']>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    username: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 3;
      }>;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ContentTypeSchemas {
      'admin::api-token': AdminApiToken;
      'admin::api-token-permission': AdminApiTokenPermission;
      'admin::audit-log': AdminAuditLog;
      'admin::permission': AdminPermission;
      'admin::role': AdminRole;
      'admin::session': AdminSession;
      'admin::transfer-token': AdminTransferToken;
      'admin::transfer-token-permission': AdminTransferTokenPermission;
      'admin::user': AdminUser;
      'api::archivio-materiali.archivio-materiali': ApiArchivioMaterialiArchivioMateriali;
      'api::azienda.azienda': ApiAziendaAzienda;
      'api::badge.badge': ApiBadgeBadge;
      'api::candidato.candidato': ApiCandidatoCandidato;
      'api::candidatura.candidatura': ApiCandidaturaCandidatura;
      'api::certificazione.certificazione': ApiCertificazioneCertificazione;
      'api::colloquio.colloquio': ApiColloquioColloquio;
      'api::domanda.domanda': ApiDomandaDomanda;
      'api::feedback.feedback': ApiFeedbackFeedback;
      'api::materiale-on-boarding.materiale-on-boarding': ApiMaterialeOnBoardingMaterialeOnBoarding;
      'api::messaggio.messaggio': ApiMessaggioMessaggio;
      'api::motore-compatibilita.motore-compatibilita': ApiMotoreCompatibilitaMotoreCompatibilita;
      'api::obiettivo-carriera.obiettivo-carriera': ApiObiettivoCarrieraObiettivoCarriera;
      'api::offerta-lavoro.offerta-lavoro': ApiOffertaLavoroOffertaLavoro;
      'api::offerte-salvate.offerte-salvate': ApiOfferteSalvateOfferteSalvate;
      'api::profilo-azienda.profilo-azienda': ApiProfiloAziendaProfiloAzienda;
      'api::profilo-candidato.profilo-candidato': ApiProfiloCandidatoProfiloCandidato;
      'api::requisito-posizione.requisito-posizione': ApiRequisitoPosizioneRequisitoPosizione;
      'api::risultato-test.risultato-test': ApiRisultatoTestRisultatoTest;
      'api::test.test': ApiTestTest;
      'api::tracciamento-fruizione.tracciamento-fruizione': ApiTracciamentoFruizioneTracciamentoFruizione;
      'plugin::content-releases.release': PluginContentReleasesRelease;
      'plugin::content-releases.release-action': PluginContentReleasesReleaseAction;
      'plugin::i18n.locale': PluginI18NLocale;
      'plugin::review-workflows.workflow': PluginReviewWorkflowsWorkflow;
      'plugin::review-workflows.workflow-stage': PluginReviewWorkflowsWorkflowStage;
      'plugin::upload.file': PluginUploadFile;
      'plugin::upload.folder': PluginUploadFolder;
      'plugin::users-permissions.permission': PluginUsersPermissionsPermission;
      'plugin::users-permissions.role': PluginUsersPermissionsRole;
      'plugin::users-permissions.user': PluginUsersPermissionsUser;
    }
  }
}
