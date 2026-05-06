const CardapioController = require('../controllers/cardapio_controller')
const IngredienteController = require('../controllers/ingrediente_controller');
const PedidoController = require('../controllers/pedido_controller');

function Routes(app) {
  app.get('/cardapios/', (req, res) => { CardapioController.index(req, res) })
  app.get('/cardapio/:id', (req, res) => { CardapioController.show(req, res) })
  app.post('/cardapio/', (req, res) => { CardapioController.create(req, res) })
  app.put('/cardapio/:id', (req, res) => { CardapioController.update(req, res) })
  app.delete('/cardapio/:id', (req, res) => { CardapioController.delete(req, res) })

  app.get('/ingredientes/', (req, res) => { IngredienteController.index(req, res) })
  app.get('/ingrediente/:id', (req, res) => { IngredienteController.show(req, res) })
  app.post('/ingrediente/', (req, res) => { IngredienteController.create(req, res) })
  app.put('/ingrediente/:id', (req, res) => { IngredienteController.update(req, res) })
  app.delete('/ingrediente/:id', (req, res) => { IngredienteController.delete(req, res) })

  app.get('/pedidos/', (req, res) => { PedidoController.index(req, res) })
  app.get('/pedido/:id', (req, res) => { PedidoController.show(req, res) })
  app.post('/pedido/', (req, res) => { PedidoController.create(req, res) })
  app.post('/pedido/:id/finalizar', (req, res) => { PedidoController.finalizar(req, res) })
  app.post('/pedido/:id/fechar', (req, res) => { PedidoController.fechar(req, res) })
}

module.exports = Routes