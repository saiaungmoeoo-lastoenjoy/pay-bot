const Telegraf = require("telegraf");
const env = require("dotenv");
env.config();
const { Markup } = Telegraf;

const app = new Telegraf(process.env.TELEGRAM_KEY);
const PAYMENT_TOKEN = process.env.PAYMENT_KEY;

const products = [
  {
    name: "Mens Casual Premium Slim Fit T-Shirts",
    price: 22.99,
    description: "Slim-fitting style, contrast raglan long sleeve, three-button henley placket, light weight & soft fabric for breathable and comfortable wearing. And Solid stitched shirts with round neck made for durability and a great fit for casual fashion wear and diehard baseball fans. The Henley style round neckline includes a three-button placket.",
    photoUrl: "https://fakestoreapi.com/img/71-3HjGNDUL._AC_SY879._SX._UX._SY._UY_.jpg",
  },
  {
    name: "Mens Cotton Jacket",
    price: 53.99,
    description: "great outerwear jackets for Spring/Autumn/Winter, suitable for many occasions, such as working, hiking, camping, mountain/rock climbing, cycling, traveling or other outdoors. Good gift choice for you or your family member. A warm hearted love to Father, husband or son in this thanksgiving or Christmas Day.",
    category: "men's clothing",
    photoUrl: "https://fakestoreapi.com/img/71li-ujtlUL._AC_UX679_.jpg",
  },
  {
    name: "Mens Casual Slim Fit",
    price: 13.99,
    description: "The color could be slightly different between on the screen and in practice. / Please note that body builds vary by person, therefore, detailed size information should be reviewed below on the product description.",
    category: "men's clothing",
    photoUrl: "https://fakestoreapi.com/img/71YXzeOuslL._AC_UY879_.jpg",
  },
];

function createInvoice(product) {
  return {
    provider_token: PAYMENT_TOKEN,
    start_parameter: "foo",
    title: product.name,
    description: product.description,
    category: product.category,
    currency: "USD",
    photo_url: product.photoUrl,
    is_flexible: false,
    need_shipping_address: false,
    prices: [{ label: product.name, amount: Math.trunc(product.price * 100) }],
    payload: {},
  };
}

// Start command
app.command("start", ({ reply }) => reply("Welcome, nice to meet you! I can sell you various products. Just ask."));

// Show offer
app.command("buy", async ({ replyWithMarkdown }) => {
  {
    return replyWithMarkdown(
      `
You want to know what I have to offer? Sure!

${products.reduce((acc, p) => {
  return (acc += `*${p.name}* - ${p.price} €\n`);
}, "")}
What do you want?`,
      Markup.keyboard(products.map((p) => p.name))
        .oneTime()
        .resize()
        .extra()
    );
  }
});

// Order product
products.forEach((p) => {
  app.hears(p.name, (ctx) => {
    console.log(`${ctx.from.first_name} is about to buy a ${p.name}.`);
    ctx.replyWithInvoice(createInvoice(p));
  });
});

// Handle payment callbacks
app.on("pre_checkout_query", ({ answerPreCheckoutQuery }) => answerPreCheckoutQuery(true));
app.on("successful_payment", (ctx) => {
  console.log(`${ctx.from.first_name} (${ctx.from.username}) just payed ${ctx.message.successful_payment.total_amount / 100} €.`);
});

app.startPolling();
