const cryptoJS = require("crypto-js");

class Block {
  constructor(data = [], index, prevHash, hash, nonce) {
    this.timestamp = Date.now();
    this.data = data;
    this.index = index;
    this.prevHash = prevHash;
    this.hash = hash;
    this.nonce = nonce;
  }

  getHash() {
    // Hexadécimal
    return cryptoJS.SHA256(JSON.stringify(this.nonce + this.prevHash + this.timestamp + JSON.stringify(this.data))).toString(cryptoJS.enc.Hex);
  }

  mine() {
    while (this.hash.startsWith('00') == false) {
      this.nonce += 1;
      this.hash = this.getHash();
    }
    return this.nonce;
  }
}

class Blockchain {
  constructor() {
    this.chainLength = 0;
    this.chain = [];
    let block = new Block(["Genesis", "Genesis", money], this.chainLength + 1, '0', '0', 0);
    this.addBlock(block);
    console.log('création blockchain faite avec genesis');
  }

  getLastBlock() {
    // Permet de récupérer le bloc length - 1 d'une blockchain
    return this.chain[this.chain.length - 1];
  }

  addBlock(block) {
    this.chain.push(block);
    this.chainLength++;
    console.log('Block ajouté');
  }

  isValid(blockchain = this) {
    // Permet de vérifier si la blockchain est valide
  }
}

//Test
let money = 0;

//Création blockchain avec genesis
let firstBlockchain = new Blockchain();

// Ajout block n°2
money = 15;
let prevHash = firstBlockchain.getLastBlock().hash;
let block2 = new Block(["Tom", "John", money], firstBlockchain.chainLength + 1, prevHash, '0', 0);
let nonce = block2.mine();
block2.hash = block2.getHash(nonce);
firstBlockchain.addBlock(block2);

//n°3
money = 900000;
prevHash = firstBlockchain.getLastBlock().hash;
let block3 = new Block(["Alice", "Charles", money], firstBlockchain.chainLength + 1, prevHash, '0', 0);
nonce = block3.mine();
block3.hash = block3.getHash(nonce);
firstBlockchain.addBlock(block3);

//blockchain finale
console.log('Je fais ' + firstBlockchain.chain.length + ' blocks');
console.log(firstBlockchain.chain);

//blockchain valide
