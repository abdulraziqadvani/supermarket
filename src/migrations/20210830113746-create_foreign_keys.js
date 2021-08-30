'use strict';

module.exports = {
  up: async queryInterface => {
    return Promise.all([
      queryInterface.sequelize.query('ALTER TABLE public.cart ADD CONSTRAINT user_id_fk FOREIGN KEY (user_id) REFERENCES public.user(id);'),
      queryInterface.sequelize.query('ALTER TABLE public.offer ADD CONSTRAINT product_id_fk FOREIGN KEY (product_id) REFERENCES public.product(id);'),
      queryInterface.sequelize.query('ALTER TABLE public.cart_product ADD CONSTRAINT cart_id_fk FOREIGN KEY (cart_id) REFERENCES public.cart(id);'),
      queryInterface.sequelize.query(
        'ALTER TABLE public.cart_product ADD CONSTRAINT product_id_fk FOREIGN KEY (product_id) REFERENCES public.product(id);',
      ),
      queryInterface.sequelize.query(
        'ALTER TABLE public.cart_product ADD CONSTRAINT offer_id_fk FOREIGN KEY (offer_id) REFERENCES public.offer(id);',
      ),
    ]);
  },

  down: async queryInterface => {
    return Promise.all([
      queryInterface.sequelize.query('ALTER TABLE public.cart DROP CONSTRAINT user_id_fk;'),
      queryInterface.sequelize.query('ALTER TABLE public.offer DROP CONSTRAINT product_id_fk;'),
      queryInterface.sequelize.query('ALTER TABLE public.cart_product DROP CONSTRAINT cart_id_fk;'),
      queryInterface.sequelize.query('ALTER TABLE public.cart_product DROP CONSTRAINT product_id_fk;'),
      queryInterface.sequelize.query('ALTER TABLE public.cart_product DROP CONSTRAINT offer_id_fk;'),
    ]);
  },
};
