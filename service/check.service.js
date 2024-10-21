const languagetool = require("languagetool-api");
const userModel = require('../models/user.model');

const checkSpelling = (text, language) => {
  return new Promise((resolve, reject) => {
    if (!text) {
      return reject(new Error("Matn yuborilishi kerak"));
    }

    var params = {
      language,
      text
    };

    languagetool.check(params, (err, result) => {
      if (err) {
        return reject(new Error("Server xatosi"));
      } else {
        languagetool.bestSuggestion(result, (suggestions) => {
          const formattedSuggestions = suggestions.map(item => ({
            message: item,
          }));

          resolve({
            originalText: text,
            suggestions: formattedSuggestions
          });
        });
      }
    });
  });
};

const saveSpellCheckResults = async (userId, date, originalText, suggestions) => {
  if (!originalText || !date || !suggestions) {
    throw new Error('Barcha maydonlar to\'ldirilishi kerak');
  }

  const user = await userModel.findById(userId);
  if (!user) {
    throw new Error('Foydalanuvchi topilmadi');
  }

  if (!user.spellCheckResults) {
    user.spellCheckResults = [];
  }

  const formattedDate = new Date(date).toISOString().split('T')[0];
  const existingData = user.spellCheckResults.find(item => item.date === formattedDate);

  const dataToSave = {
    originalText,
    suggestions
  };

  if (existingData) {
    existingData.texts.push(dataToSave);
  } else {
    user.spellCheckResults.push({
      date: formattedDate,
      texts: [dataToSave]
    });
  }

  await user.save();
};

module.exports = {
  checkSpelling,
  saveSpellCheckResults
};
