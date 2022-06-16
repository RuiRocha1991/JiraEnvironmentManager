const Datastore = require('nedb-promises');
const path = require('path');
const { app } = require('electron');
const { createCipheriv, createDecipheriv } = require('crypto');
const dbHelper = require('./db-helper');

const algorithm = 'aes-256-cbc'; // you can choose many algorithm from cryptojs
const key = Buffer.from(
  '3a2a537576392c0fa9974fe3e73f0678a76ca9663c83aef2f3da104ace8bb0bb',
  'hex'
);
const iv = Buffer.from('2550eff4d3852e6ebc3872209d9e5f39', 'hex');

const afterSerialization = (doc: string) => {
  if (dbHelper.default.isJson(doc)) {
    const cipher = createCipheriv(algorithm, key, iv);
    return (
      cipher.update(JSON.stringify(doc), 'utf8', 'hex') + cipher.final('hex')
    );
  }
  return doc;
};

const beforeSerialization = (doc: string) => {
  const decipher = createDecipheriv(algorithm, key, iv);

  try {
    const decrypted =
      decipher.update(doc, 'hex', 'utf8') + decipher.final('utf8');
    return JSON.parse(decrypted);
  } catch (e) {
    return doc;
  }
};

const jiraInstances = Datastore.create({
  filename: path.join(app.getPath('userData'), 'jiraInstances.db'),
  autoload: true,
  afterSerialization: (doc: string) => afterSerialization(doc),
  beforeDeserialization: (doc: string) => beforeSerialization(doc),
});

const settings = Datastore.create({
  filename: path.join(app.getPath('userData'), 'settings.db'),
  autoload: true,
  afterSerialization: (doc: string) => afterSerialization(doc),
  beforeDeserialization: (doc: string) => beforeSerialization(doc),
});

const mainDB = {
  jiraInstances,
  settings,
};

export default mainDB;
