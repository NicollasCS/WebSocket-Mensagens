const Pedido = require('../models/pedido');
const Pagamento = require('../models/pagamento');
const Cardapio = require('../models/cardapio');
const Ingrediente = require('../models/ingrediente');
const CardapioIngrediente = require('../models/cardapio_ingrediente');

class PedidoController {
  static async index(req, res) {
    const pedidos = await Pedido.findAll({
      where: {
        estado: 'Em Preparo',
      },
    });

    res.status(200).json(pedidos);
  }
  static async show(req, res) {
    const { id } = req.params;
    const pedido = await Pedido.findByPk(id);

    res.status(pedido == null ? 404 : 200).json(pedido || {});
  }
  static async create(req, res) {
    const { descricao, cliente, itens } = req.body;
    let pedido = await Pedido.create({ descricao, cliente });
    pedido.preco = 0;

    for (let i = 0; i < itens.length; i += 1) {
      const cardapio = await Cardapio.findByPk(itens[i]);
      pedido.preco += cardapio.preco;
    }

    await pedido.save();

    for (let i = 0; i < itens.length; i += 1) {
      const cis = await CardapioIngrediente.findOne({ id: itens[i] });
      let ingrediente = await Ingrediente.findByPk(cis.ingredienteId);

      ingrediente.quantidade -= 1;
      await ingrediente.save();

      if (ingrediente.quantidade == 0) {
        let cardapio = await Cardapio.findByPk(itens[i]);
        cardapio.disponivel = false;
        await cardapio.save();
      }
    }

    res.status(200).json(pedido);
  }

  static async finalizar(req, res) {
    const { id } = req.params;
    const pedido = await Pedido.findByPk(id);

    if (pedido == null) {
      res.status(404).json({});
      return;
    }

    pedido.estado = 'Pronto';
    await pedido.save();

    res.status(200).json(pedido);
  }

  static async fechar(req, res) {
    const { id } = req.params;
    const { metodo } = req.body;
    const pedido = await Pedido.findByPk(id);

    if (pedido == null) {
      res.status(404).json({});
      return;
    }

    if (pedido.estado !== 'Pronto') {
      res.status(400).json({ message: 'Pedido não finalizado!' });
      return;
    }

    let pagamento = await Pagamento.create({
      pedidoId: id,
      metodo: metodo,
    });

    res.status(200).json(pedido);
  }
}

module.exports = PedidoController;
