'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = {
  async register(ctx) {
    const { body } = ctx.request;

    const { username, email, password, tipo } = body;

    if (!['candidato', 'azienda'].includes(tipo)) {
      return ctx.badRequest('Tipo utente non valido');
    }

    // Chiama il controller di default per registrare l'utente
    const user = await strapi
      .plugin('users-permissions')
      .controllers.auth.register(ctx);

    // Se la registrazione ha avuto successo
    if (user && user.user && user.user.id) {
      const userId = user.user.id;

      if (tipo === 'candidato') {
        await strapi.entityService.create('api::candidato.candidato', {
          data: {
            user: userId,
          },
        });
      } else if (tipo === 'azienda') {
        await strapi.entityService.create('api::azienda.azienda', {
          data: {
            user: userId,
          },
        });
      }
    }

    return user;
  },
};
