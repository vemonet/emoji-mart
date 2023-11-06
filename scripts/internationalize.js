const fs = require('fs');

// ️Variation Selector-16
const VS16 = "\ufe0f";
// Zero Width Joiner
const ZWJ = "\u200D";
// Remove VS16 and ZWJ from emoji to compare CLDR / emoji-mart data
const strippedEmoji = (emoji) => emoji.replaceAll(VS16, "").replaceAll(ZWJ, "");

// Read emoji-mart data

async function main() {
  const martData = await (await fetch(`https://raw.github.com/missive/emoji-mart/main/packages/emoji-mart-data/sets/14/native.json`)).json()
  // let martData = JSON.parse(fs.readFileSync("packages/emoji-mart-data/sets/14/native.json", "utf-8"));

  const langs = []
  fs.readdirSync("packages/emoji-mart-data/i18n").forEach(file => {
    langs.push(file.replace(".json", ""))
  });

  for (const lang of langs) {
    console.log(`🏳️ Generating translation for ${lang}`)
    // Read CLDR data: git clone https://github.com/unicode-org/cldr-json
    // const langResp = await fetch(`https://raw.github.com/unicode-org/cldr-json/main/cldr-json/cldr-annotations-full/annotations/${lang}/annotations.json`)
    const langFull = await (await fetch(`https://raw.github.com/unicode-org/cldr-json/main/cldr-json/cldr-annotations-full/annotations/${lang}/annotations.json`)).json()
    const langDerived = await (await fetch(`https://raw.github.com/unicode-org/cldr-json/main/cldr-json/cldr-annotations-derived-full/annotationsDerived/${lang}/annotations.json`)).json()

    // If cloned the repo locally:
    // const langFull = JSON.parse(fs.readFileSync(`cldr-json/cldr-json/cldr-annotations-full/annotations/${lang}/annotations.json`, "utf-8"));
    // const langDerived = JSON.parse(fs.readFileSync(`cldr-json/cldr-json/cldr-annotations-derived-full/annotationsDerived/${lang}/annotations.json`, "utf-8"));

    // Combine data
    for (const emojiId in martData.emojis) {
      const emojiData = martData.emojis[emojiId];
      const emoji = strippedEmoji(emojiData.skins[0].native);

      const langFullEmoji = Object.keys(langFull.annotations.annotations).find(
        (langFullEmoji) => emoji === strippedEmoji(langFullEmoji)
      );
      if (langFullEmoji) {
        emojiData.name = langFull.annotations.annotations[langFullEmoji].tts[0];
        emojiData.keywords = langFull.annotations.annotations[langFullEmoji].default;
      }

      const langDerivedEmoji = Object.keys(
        langDerived.annotationsDerived.annotations
      ).find((langDerivedEmoji) => emoji === strippedEmoji(langDerivedEmoji));
      if (langDerivedEmoji) {
        emojiData.name = langDerived.annotationsDerived.annotations[langDerivedEmoji].tts[0];
        emojiData.keywords = langDerived.annotationsDerived.annotations[langDerivedEmoji].default;
      }
    }

    // Write localized data
    fs.writeFileSync(`packages/emoji-mart-data/i18n-native/${lang}.json`, JSON.stringify(martData));
  }
}

main()

// https://github.com/unicode-org/cldr-json/blob/main/cldr-json/cldr-annotations-derived-full/annotationsDerived/fr/annotations.json
// https://github.com/unicode-org/cldr-json/blob/main/cldr-json/cldr-annotations-full/annotations/fr/annotations.json
