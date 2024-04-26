import { Page } from "puppeteer";

const { setViewport, wait } = require("../dist/helpers/helpers");
const chats = require("../dist/helpers/chats");
const frequency = require("../dist/helpers/frequency");

const url =
  "https://www.aaaauto.pl/benzin/#!&make[]=74&make[]=87&make[]=130&model[]=1207&model[]=36613&model[]=1826&model[]=844&palivo=1&transmission=A&pmax=70000";

const script = async (page: Page) => {
  await page.goto(url);

  await setViewport(page);

  await wait(5000);

  return page.evaluate(async () => {
    return [
      ...document.querySelectorAll("#carsGrid .card.box"),
    ]
      .filter(n => n.querySelector(".carInfoImg"))
      .map(function (node) {
        const href = node.querySelector('a').href;

        return {
          id: href.split('#')[0],
          title: node.querySelector('h2 > a').innerText,
          price: node.querySelector(".carPrice h3.notranslate:not(.primary):not(.error)").innerText,
          specs: node
            .querySelector(".columnsTags")
            .innerText.split("\n").join(', '),
          img:
            "<a href='" + node.querySelector(".carInfoImg > figure > img").src + "'>Img</a>",
          url:
            "<a href='" + href + "'>Link</a>",
        };
      });
  });
};

module.exports = {
  script,
  name: "AAA Auto",
  chatId: chats.IVAN_KAYZER,
  frequency: frequency.hours(2),
};
