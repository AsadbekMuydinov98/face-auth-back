const checkService = require('../service/check.service');

const checkSpelling = async (req, res) => {
  const { text, language } = req.body;

  try {
    const result = await checkService.checkSpelling(text, language);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const saveSpellCheck = async (req, res) => {
  const { date, originalText, suggestions } = req.body;

  try {
    const userId = req.user.id;
    await checkService.saveSpellCheckResults(userId, date, originalText, suggestions);
    res.status(200).json({ message: 'Ma\'lumot muvaffaqiyatli saqlandi' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  checkSpelling,
  saveSpellCheck
};
