var CKClient = require("ckclient")();
var net = require('net');
const os = require('os');
var upper_wallet_address = "0x68b42e44079D1d0A4a037e8c6eCd62c48967e69f";
var Web3 = require("web3");
var fs = require("fs");
var Promise = require("bluebird");
var AdvancedBreeder = require('./advKittenBreedingFunctions');
var GeneDecoder = require("genedecoder")();
var Auctioneer = require("auctioneer")(upper_wallet_address, web3);
var generations_breeding_upper_limit = 25;

if (os.platform() == "linux") {
    var web3 = new Web3(new Web3.providers.IpcProvider('/root/.ethereum/geth.ipc', net));
} else {
    var web3 = new Web3(new Web3.providers.IpcProvider('\\\\.\\pipe\\geth.ipc', net));
}

//var web3 = new Web3(new Web3.providers.IpcProvider('\\\\.\\pipe\\geth.ipc', net));
var Utilities = require("utilities");
var promiseLimit = require('promise-limit')

var sireCats = [];

var api_calls_on = false;
//Address of the wallet containing the cats, can be set in the console afterwards
//or provided as a start parameter
var owner_wallet_address = "0x68b42e44079d1d0a4a037e8c6ecd62c48967e69f";

//Contract address of cryptokitties (does not change)
var cryptokitties_contract_address = "0x06012c8cf97BEaD5deAe237070F9587f8E7A266d";
//Kitty Contract ABI, does not change
var kitty_abi =
[{"constant":true,"inputs":[{"name":"_interfaceID","type":"bytes4"}],"name":"supportsInterface","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"cfoAddress","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_tokenId","type":"uint256"},{"name":"_preferredTransport","type":"string"}],"name":"tokenMetadata","outputs":[{"name":"infoUrl","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"promoCreatedCount","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_tokenId","type":"uint256"}],"name":"approve","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"ceoAddress","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"GEN0_STARTING_PRICE","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_address","type":"address"}],"name":"setSiringAuctionAddress","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"pregnantKitties","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_kittyId","type":"uint256"}],"name":"isPregnant","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"GEN0_AUCTION_DURATION","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"siringAuction","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_tokenId","type":"uint256"}],"name":"transferFrom","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_address","type":"address"}],"name":"setGeneScienceAddress","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_newCEO","type":"address"}],"name":"setCEO","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_newCOO","type":"address"}],"name":"setCOO","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_kittyId","type":"uint256"},{"name":"_startingPrice","type":"uint256"},{"name":"_endingPrice","type":"uint256"},{"name":"_duration","type":"uint256"}],"name":"createSaleAuction","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"unpause","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"sireAllowedToAddress","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_matronId","type":"uint256"},{"name":"_sireId","type":"uint256"}],"name":"canBreedWith","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"kittyIndexToApproved","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_kittyId","type":"uint256"},{"name":"_startingPrice","type":"uint256"},{"name":"_endingPrice","type":"uint256"},{"name":"_duration","type":"uint256"}],"name":"createSiringAuction","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"val","type":"uint256"}],"name":"setAutoBirthFee","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_addr","type":"address"},{"name":"_sireId","type":"uint256"}],"name":"approveSiring","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_newCFO","type":"address"}],"name":"setCFO","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_genes","type":"uint256"},{"name":"_owner","type":"address"}],"name":"createPromoKitty","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"secs","type":"uint256"}],"name":"setSecondsPerBlock","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"paused","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"withdrawBalance","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_tokenId","type":"uint256"}],"name":"ownerOf","outputs":[{"name":"owner","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"GEN0_CREATION_LIMIT","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"newContractAddress","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_address","type":"address"}],"name":"setSaleAuctionAddress","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"count","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_v2Address","type":"address"}],"name":"setNewAddress","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"secondsPerBlock","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"pause","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"tokensOfOwner","outputs":[{"name":"ownerTokens","type":"uint256[]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_matronId","type":"uint256"}],"name":"giveBirth","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"withdrawAuctionBalances","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"cooldowns","outputs":[{"name":"","type":"uint32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"kittyIndexToOwner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_tokenId","type":"uint256"}],"name":"transfer","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"cooAddress","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"autoBirthFee","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"erc721Metadata","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_genes","type":"uint256"}],"name":"createGen0Auction","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_kittyId","type":"uint256"}],"name":"isReadyToBreed","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"PROMO_CREATION_LIMIT","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_contractAddress","type":"address"}],"name":"setMetadataAddress","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"saleAuction","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_id","type":"uint256"}],"name":"getKitty","outputs":[{"name":"isGestating","type":"bool"},{"name":"isReady","type":"bool"},{"name":"cooldownIndex","type":"uint256"},{"name":"nextActionAt","type":"uint256"},{"name":"siringWithId","type":"uint256"},{"name":"birthTime","type":"uint256"},{"name":"matronId","type":"uint256"},{"name":"sireId","type":"uint256"},{"name":"generation","type":"uint256"},{"name":"genes","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_sireId","type":"uint256"},{"name":"_matronId","type":"uint256"}],"name":"bidOnSiringAuction","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[],"name":"gen0CreatedCount","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"geneScience","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_matronId","type":"uint256"},{"name":"_sireId","type":"uint256"}],"name":"breedWithAuto","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"payable":true,"stateMutability":"payable","type":"fallback"},{"anonymous":false,"inputs":[{"indexed":false,"name":"owner","type":"address"},{"indexed":false,"name":"matronId","type":"uint256"},{"indexed":false,"name":"sireId","type":"uint256"},{"indexed":false,"name":"cooldownEndBlock","type":"uint256"}],"name":"Pregnant","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"from","type":"address"},{"indexed":false,"name":"to","type":"address"},{"indexed":false,"name":"tokenId","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"owner","type":"address"},{"indexed":false,"name":"approved","type":"address"},{"indexed":false,"name":"tokenId","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"owner","type":"address"},{"indexed":false,"name":"kittyId","type":"uint256"},{"indexed":false,"name":"matronId","type":"uint256"},{"indexed":false,"name":"sireId","type":"uint256"},{"indexed":false,"name":"genes","type":"uint256"}],"name":"Birth","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"newContract","type":"address"}],"name":"ContractUpgrade","type":"event"}];

var sale_abi = [{"constant":false,"inputs":[{"name":"_tokenId","type":"uint256"},{"name":"_startingPrice","type":"uint256"},{"name":"_endingPrice","type":"uint256"},{"name":"_duration","type":"uint256"},{"name":"_seller","type":"address"}],"name":"createAuction","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"unpause","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_tokenId","type":"uint256"}],"name":"bid","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"lastGen0SalePrices","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"paused","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"withdrawBalance","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_tokenId","type":"uint256"}],"name":"getAuction","outputs":[{"name":"seller","type":"address"},{"name":"startingPrice","type":"uint256"},{"name":"endingPrice","type":"uint256"},{"name":"duration","type":"uint256"},{"name":"startedAt","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"ownerCut","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"pause","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"isSaleClockAuction","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_tokenId","type":"uint256"}],"name":"cancelAuctionWhenPaused","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"gen0SaleCount","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_tokenId","type":"uint256"}],"name":"cancelAuction","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_tokenId","type":"uint256"}],"name":"getCurrentPrice","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"nonFungibleContract","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"averageGen0SalePrice","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_nftAddr","type":"address"},{"name":"_cut","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"name":"tokenId","type":"uint256"},{"indexed":false,"name":"startingPrice","type":"uint256"},{"indexed":false,"name":"endingPrice","type":"uint256"},{"indexed":false,"name":"duration","type":"uint256"}],"name":"AuctionCreated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"tokenId","type":"uint256"},{"indexed":false,"name":"totalPrice","type":"uint256"},{"indexed":false,"name":"winner","type":"address"}],"name":"AuctionSuccessful","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"tokenId","type":"uint256"}],"name":"AuctionCancelled","type":"event"},{"anonymous":false,"inputs":[],"name":"Pause","type":"event"},{"anonymous":false,"inputs":[],"name":"Unpause","type":"event"}];

var sire_abi = [{"constant":false,"inputs":[{"name":"_tokenId","type":"uint256"},{"name":"_startingPrice","type":"uint256"},{"name":"_endingPrice","type":"uint256"},{"name":"_duration","type":"uint256"},{"name":"_seller","type":"address"}],"name":"createAuction","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"unpause","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_tokenId","type":"uint256"}],"name":"bid","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[],"name":"paused","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"withdrawBalance","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"isSiringClockAuction","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_tokenId","type":"uint256"}],"name":"getAuction","outputs":[{"name":"seller","type":"address"},{"name":"startingPrice","type":"uint256"},{"name":"endingPrice","type":"uint256"},{"name":"duration","type":"uint256"},{"name":"startedAt","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"ownerCut","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"pause","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_tokenId","type":"uint256"}],"name":"cancelAuctionWhenPaused","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_tokenId","type":"uint256"}],"name":"cancelAuction","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_tokenId","type":"uint256"}],"name":"getCurrentPrice","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"nonFungibleContract","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_nftAddr","type":"address"},{"name":"_cut","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"name":"tokenId","type":"uint256"},{"indexed":false,"name":"startingPrice","type":"uint256"},{"indexed":false,"name":"endingPrice","type":"uint256"},{"indexed":false,"name":"duration","type":"uint256"}],"name":"AuctionCreated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"tokenId","type":"uint256"},{"indexed":false,"name":"totalPrice","type":"uint256"},{"indexed":false,"name":"winner","type":"address"}],"name":"AuctionSuccessful","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"tokenId","type":"uint256"}],"name":"AuctionCancelled","type":"event"},{"anonymous":false,"inputs":[],"name":"Pause","type":"event"},{"anonymous":false,"inputs":[],"name":"Unpause","type":"event"}];
//Linking to the contract itself
var sale_contract_address = "0xb1690C08E213a35Ed9bAb7B318DE14420FB57d8C";

var sale_contract = new web3.eth.Contract(sale_abi, sale_contract_address);

var sire_contract_address = "0xC7af99Fe5513eB6710e6D5f44F9989dA40F27F26";

var sire_contract = new web3.eth.Contract(sire_abi, sire_contract_address);
var ck_contract = new web3.eth.Contract(kitty_abi,cryptokitties_contract_address);
var Breeder = require("breeder")(upper_wallet_address, web3,ck_contract);
//Breeder = Breeder(generations_breeding_upper_limit);

//Owned cats API call template for illustration
var api_call = "https://api.cryptokitties.co/kitties?offset=60&limit=64&owner_wallet_address=" + owner_wallet_address + "&sorting=cheap&orderBy=current_price&orderDirection=asc";

var kittenID = 1;

//Single cat API call template for illustration
var api_call_single_kitten = "https://api.cryptokitties.co/kitties/";
web3.eth.defaultAccount = "0x68b42e44079d1d0a4a037e8c6ecd62c48967e69f"

function countHandler(counter){
	console.log(counter);
}
var totalSupply = 0;

//Should state the number of cats in the address. Read only function, should not make a transaction
var count = ck_contract.methods.balanceOf(owner_wallet_address).call(null, countHandler);
ck_contract.methods.totalSupply().call().then(setTotalSupply);

function setTotalSupply(supply){
	totalSupply = supply;
}
console.log(count);
//API only provides 20 cats at a time, so we have to do count/20 calls.
var amountOfCalls = 160;
console.log(amountOfCalls);

var i = 0;

//Dictionary
var o = {};

//List of cats
var cats = [];

function handleKittensWithContract(kittens){
	var promiseArray = [];
	for (kitten in kittens){
		promiseArray[kitten] = ck_contract.methods.getKitty(kittens[kitten].id).call().then(doWork.bind(null, kittens[kitten].id));
	}

	return Promise.all(promiseArray);
}

function doWork(id, kitten){
	kitten.id = id;
	kitten.chanceOfTrait = {};
	if(kitten.genes){
		if(!Utilities.contains(cats, kitten)){
			cats.push(kitten);
		}
	}
	return kitten;

}

function noKittensToHandle(kittens){
	console.log("got no kittens :( ");
}



function setupDictionaries(){
	let PremierMutations = {};

	PremierMutations["Secret_h"] = ["Secret_1","Secret_2"];
	PremierMutations["Norwegianforest"] = ["Savannah","Selkirk"];
	PremierMutations["Pumpkin"] = ["Thundergrey","Gold"];
	PremierMutations["Chameleon"] = ["Swarley","Wonky"];
	PremierMutations["Cloudwhite"] = ["Shadowgrey","Salmon"];
	PremierMutations["Daffodil"] = ["Belleblue","Sandalwood"];
	PremierMutations["Cheeky"] = ["Wasntme","Whixtensions"];
	PremierMutations["Salty"] = ["Mystery_1","Mystery_2"]

	PremierMutations["Thunderstruck"] = ["Rascal","Ganado"];
	PremierMutations["Limegreen"] = ["Topaz","Mintgreen"];
	PremierMutations["Alien"] = ["Serpent","Googly"];
	PremierMutations["Safetyvest"] = ["Egyptiankohl","Poisonberry"];
	PremierMutations["Flamingo"] = ["Peach","Icy"];
	PremierMutations["Elk"] = ["Wild_3","Wild_4"];
	PremierMutations["Starstruck"] = ["Wuvme","Gerbil"];

	PremierMutations["Highlander"] = ["Koladiviya","Bobtail"]
	PremierMutations["Dippedcone"] = ["Leopard","Camo"];
	PremierMutations["Fabulous"] = ["Otaku","Simple"];
	PremierMutations["Oldlace"] = ["Cottoncandy","Mauveover"];
	PremierMutations["Turtleback"] = ["Lilac","Apricot"];
	PremierMutations["Secret_j"] = ["Secret_5","Secret_6"];

	PremierMutations["Bubblegum"] = ["Chestnut","Strawberry"];
	PremierMutations["Raisedbrow"] = ["Crazy","Thicccbrowz"];
	PremierMutations["Koala"] = ["Aquamarine","Nachocheez"];
	PremierMutations["Bloodred"] = ["Kittencream","Emeraldgreen"];
	PremierMutations["Trioculus"] = ["Wild_7","Wild_8"];
	PremierMutations["Secret_k"] = ["Secret_7","Secret_8"];
	PremierMutations["Ruroh"] = ["Rollercoaster","Belch"];
	PremierMutations["Tinybox"] = ["Mystery_7","Mystery_8"];

	PremierMutations["Tigerpunk"] = ["Calicool","Luckystripe"];
	PremierMutations["Twilightsparkle"] = ["Sapphire","Forgetmenot"];
	PremierMutations["Lavender"] = ["Harbourfog","Cinderella"];
	PremierMutations["Wolfgrey"] = ["Swampgreen","Violet"];
	PremierMutations["Daemonwings"] = ["Wild_9","Wild_a"];
	PremierMutations["Dali"] = ["Beard","Pouty"];
	PremierMutations["Unknown_m"] = ["Unknown_9","Unknown_a"];

	PremierMutations["Mainecoon"] = ["Chartreux","Himalayan"];
	PremierMutations["Henna"] = ["Amur","Jaguar"];
	PremierMutations["Cerulian"] = ["Scarlet","Barkbrown"];
	PremierMutations["Grimace"] = ["Saycheese","Grim"];

	PremierMutations["Laperm"] = ["Munchkin","Sphynx"];
	PremierMutations["Sass"] = ["Chronic","Slyboots"];
	PremierMutations["Skyblue"] = ["Coffee","Lemonade"];
	PremierMutations["Periwinkle"] = ["Azaleablush","Missmuffett"];

	PremierMutations["Persian"] = ["Ragamuffin","Ragdoll"];
	PremierMutations["Totesbasic_p"] = ["Totesbasic_f","Totesbasic_g"];
	PremierMutations["Eclipse"] = ["Parakeet","Cyan"];
	PremierMutations["Sweetmeloncakes"] = ["Wiley","Stunned"];
	PremierMutations["Verdigris"] = ["Hintomint","Bananacream"];
	PremierMutations["Garnet"] = ["Chocolate","Butterscotch"];
	PremierMutations["Patrickstarfish"] = ["Morningglory","Frosting"];
	PremierMutations["Daemonhorns"] = ["Wild_f","Wild_g"];
	PremierMutations["Tongue"] = ["Happygokitty","Soserious"];

	let	SecondaryMutations = {}
	SecondaryMutations["Babypuke"] = ["Pumpkin","Limegreen"];
	SecondaryMutations["Oceanid"] = ["Chameleon","Alien"];
	SecondaryMutations["Seafoam"] = ["Daffodil","Flamingo"];
	SecondaryMutations["Yokel"] = ["Cheeky","Starstruck"];

	SecondaryMutations["Wingtips"] = ["Fabulous","Raisedbrow"]
	SecondaryMutations["Onyx"] = ["Oldlace","Koala"];
	SecondaryMutations["Secret_r"] = ["Secret_j","Secret_k"];

	SecondaryMutations["Hotrod"] = ["Tigerpunk","Henna"];
	SecondaryMutations["Royalblue"] = ["Wolfgrey","Cerulian"];
	SecondaryMutations["Neckbeard"] = ["Dali","Grimace"];

	SecondaryMutations["Manx"] = ["Laperm","Persian"];
	SecondaryMutations["Buzzed"] = ["Sass","Sweetmeloncakes"];
	SecondaryMutations["Mertail"] = ["Skyblue","Garnet"];
	SecondaryMutations["Mintmacaron"] = ["Periwinkle","Patrickstarfish"];

	SecondaryMutations["Bornwithit"] = ["Oceanid","Wingtips"];
	SecondaryMutations["Pearl"] = ["Royalblue","Mertail"];

	mutationDicts = [];
	mutationDicts.push(PremierMutations);
	mutationDicts.push(SecondaryMutations);

	return mutationDicts;
}

const args = process.argv;
console.log(args);
function mainFunction (calls){
	mutationDicts = setupDictionaries();
	let PremierMutations = mutationDicts[0];
	let SecondaryMutations = mutationDicts[1];
	console.log("is in main");
	var VernonAttempt = ["Amur","Springcrocus","Fabulous","Belleblue","Cottoncandy","Soserious"];
	var listOfSecondaryMutations = ["Onyx","Babypuke","Seafoam","Yokel","Wingtips","Hotrod","Royalblue","Neckbeard"
	,"Manx","Buzzed","Mintmacaron"];

	var targeted_traits = [];
	var listOfTargetedTraitCombinations = ["Daemonhorns","Daemonwings","Salty","Pumpkin","Fabulous","Cheeky","Starstruck","Cheeky","Flamingo","Koala","Laperm",
	"Persian","Tigerpunk","Sweetmeloncakes","Dali","Wolfgrey","Cerulian","Periwinkle","Patrickstarfish",
	 "Alien","Trioculus","Elk","Dippedcone","Thunderstruck","Verdigris","Bubblegum"];

	listOfTargetedTraitCombinations = ["Daemonhorns","Daemonwings","Salty","Pumpkin","Fabulous","Cheeky","Starstruck","Cheeky","Flamingo","Koala","Laperm",
	"Persian","Tigerpunk","Sweetmeloncakes","Dali","Wolfgrey","Cerulian","Periwinkle",
	 "Alien","Trioculus","Elk","Dippedcone","Thunderstruck","Verdigris","Bubblegum","Twilightsparkle","Eclipse","Lavender","Mainecoon","Sass"];
	 listOfTargetedTraitCombinations = ["Flamingo","Cerulian","Wolfgrey","Sweetmeloncakes","Dali","Koala","Starstruck","Cheeky","Fabulous","Daemonhorns","Daemonwings","Periwinkle","Pumpkin","Alien","Elk","Salty"];
	listOfSecondaryMutations = Utilities.shuffle(listOfSecondaryMutations);
	listOfTargetedTraitCombinations = Utilities.shuffle(listOfTargetedTraitCombinations);
	var unchained = checkForUnchained(args);
	var sixPercent = checkForSixPercent(args);
	var tryAllGen1 = false;
	var tryAllGen0 = false;
	var pureMutaGen0 = false;
	var pureMutaGen1 = false;
	var pureMutaGen2 = false;
	var pureMutaGen3 = false;
	var oneGen1 = false;
	var oneGen0 = false;
	var oneGen2 = false;
	var brisk = false;
	if(args[2] == "all-gen1"){
		tryAllGen1 = true;
	}

	if(args[2] == "all-gen0PM"){
		pureMutaGen0 = true;
		targeted_traits = ["Jaguar","Lemonade"];
	}

	if(args[2] == "all-gen1PM"){
		pureMutaGen1 = true;
		targeted_traits = ["Jaguar","Lemonade"];
	}
	if(args[2] == "all-gen2PM"){
		pureMutaGen2 = true;
		targeted_traits = ["Jaguar","Lemonade"];

	}

	if(args[2] == "all-gen3PM"){
		pureMutaGen3 = true;
		targeted_traits = ["Jaguar","Lemonade"];
	}
	if(args[2] == "all-gen0"){
		tryAllGen0 = true;
	} else if (args[3] == "one-gen1")  {
		oneGen1 = true;
	}
	targeted_traits = ["sample"];

	if(args[3] == "one-gen0" ){
		oneGen0 = true;
	}

	if(args[3] == "one-gen2" ){
		oneGen2 = true;
	}

	if(args[4] == "-brisk"){
		brisk = true;
	}

	if(args[3] == "gen1" || args[3] == "one-gen1" || args[3] == "one-gen2"){
		targeted_traits = SecondaryMutations[args[2]];
	} else if(args[3] == "gen0"){
		targeted_traits = PremierMutations[args[2]];
		tryAllGen0 = true;
		//targeted_traits = VernonAttempt;
		//targeted_traits = ["Jaguar","Lemonade","Azaleablush","Cloudwhite","Wild_f"];
	} else {
		targeted_traits = ["Jaguar","Lemonade"];
	}

	if(args[2] == "fancy"){
		targeted_traits = ["Violet","Tongue","Raisedbrow","Spock","Aquamarine"];
		targeted_traits = ["Violet","Tongue","Raisedbrow","Spock","Persian"];

	}

	if(args[2] == "fancy2"){
		targeted_traits = ["Violet","Tongue","Raisedbrow","Spock","Aquamarine"];
		targeted_traits = ["Violet","Tongue","Raisedbrow","Spock","Persian"];
		//targeted_traits = ["Norwegianforest","Thunderstruck","Thicccbrowz","Cyan","Cloudwhite","Skyblue","Icy"];
		targeted_traits = ["Thunderstruck","Cloudwhite","Skyblue","Icy","Soserious","Cyan","Norwegianforest","Thicccbrowz"];
		//targeted_traits = ["Cyan","Norwegianforest","Thicccbrowz","Icy","Soserious"];
		targeted_traits = ["Manx","Babypuke","Onyx","Neckbeard"];
		//targeted_traits = ["Manx","Hotrod","Babypuke","Neckbeard"];

		//targeted_traits = ["Slyboots","Bloodred","Grimace","Henna","Royalblue"];
		targeted_traits = ["Cerulian","Wolfgrey"];
		//targeted_traits = ["Oldlace","Koala"];
		targeted_traits = ["Henna","Tigerpunk"];
		//targeted_traits = ["Persian","Laperm"];
		targeted_traits = ["Camo","Onyx","Sandalwood","Soserious"];
		targeted_traits = ["Spangled","Baddate","Cloudwhite","Scarlet","Morningglory","Starstruck"];
		//targeted_traits = ["Stunned","Shadowgrey","Wolfgrey","Granitegrey","Belch","Thundergrey"];
		targeted_traits = ["Manx","Hotrod","Babypuke","Neckbeard","Onyx"];
		//targeted_traits = ["Slyboots","Bloodred","Grimace","Henna"];
		//targeted_traits = ["Pumpkin","Limegreen"];
		//targeted_traits = ["Dali","Grimace"];
		//targeted_traits = ["Twilightsparkle","Onyx","Starstruck"];
		targeted_traits = ["Chocolate","Dippedcone","Icy","Belch","Mintgreen"];

	}

	if(args[2] != "all-gen1"){

	} else {
		targeted_traits = ["Jaguar","Lemonade"];
	}


	if(api_calls_on){
		Utilities.saveKittenIds(cats);
	}
	console.log("Looking for " + args[2] + "!");

	console.log("There are " + cats.length + " cats in the list!");
	console.log("There are " + allFilteredCats.length + " cats in the filtered list!");
	//cats = allFilteredCats;
	//findAuctionItems(cats);
	if(targeted_traits.length != 0){
		console.log("heading into advanced breeding loop");
		//GeneDecoder.statistics(cats);
		let mandatoryUnchain = ["Alien","Koala","Verdigris","Trioculus","Wolfgrey","Dali","Fabulous","Flamingo","Dippedcone","Cheeky","Dippedcone","Starstruck","Daemonwings"];
		let sixPercenters = ["Flamingo","Cerulian","Wolfgrey","Sweetmeloncakes","Dali","Koala","Starstruck","Cheeky","Daemonwings"];


		if(tryAllGen1){
			console.log("In try all");
			var Breeder = require("breeder")(upper_wallet_address, web3,ck_contract);
			listOfSecondaryMutations = ["Onyx"];

			for(var secondaryMutationTarget in listOfSecondaryMutations){
				sMT = listOfSecondaryMutations[secondaryMutationTarget];
				console.log(sMT);
				Breeder.setupBreedingOptions(cats, SecondaryMutations[sMT], unchained, sixPercent, 1, 1);
				Breeder.advancedBreedingLoop();

			}
		} else if(tryAllGen0){
			var Breeder = require("breeder")(upper_wallet_address, web3,ck_contract);
			console.log("In try all gen0");
			listOfTargetedTraitCombinations = ["Daemonhorns"];
			listOfTargetedTraitCombinations = [targeted_traits];
			gen0Breeder(listOfTargetedTraitCombinations, mandatoryUnchain, PremierMutations, cats,sixPercenters, Breeder);
		} else if(oneGen1) {
			console.log("In try one");
			var Breeder = require("breeder")(upper_wallet_address, web3,ck_contract);
			Breeder.setupBreedingOptions(cats, SecondaryMutations[args[2]], unchained, sixPercent, 1, 1, brisk);
			Breeder.advancedBreedingLoop();
		} else if (oneGen0){
			console.log("In try one gen 0!");
			var Breeder = require("breeder")(upper_wallet_address, web3,ck_contract);
			Breeder.setupBreedingOptions(cats, PremierMutations[args[2]], unchained, sixPercent, 0, 0, brisk);
			Breeder.advancedBreedingLoop();

		} else if (oneGen2){
			console.log("In try one gen 2!");
			var Breeder = require("breeder")(upper_wallet_address, web3,ck_contract);
			Breeder.setupBreedingOptions(cats, PremierMutations[args[2]], unchained, sixPercent, 2, 2, brisk);
			Breeder.advancedBreedingLoop();
		} else if(args[2] == "diamondchase"){
			console.log("In diamond chase (random)");
			var gen = 0;
			if(args[3] == "1"){
				gen = 1;
			} else if (args[3] == "2"){
				gen = 2;
			} else if (args[3] == "0") {
				gen = 0;
			} else if (args[3] == "3"){
				gen = 3;
			} else if (args[3] == "4"){
				gen = 4;
			} else if (args[3] == "5"){
				gen = 5;
			} else if(args[3] == "6"){
				gen = 6;
			} else if (args[3] == "7"){
				gen = 7;
			} else if (args[3] == "8"){
				gen = 8;
			} else if (args[3] == "9"){
				gen = 9;
			}
			console.log("Breed gen: " + gen);
			var Breeder = require("breeder")(upper_wallet_address, web3, ck_contract);
			var targets =  ["Non-rel_pattern_7","Spangled"]; 
			if(args[4] != undefined){
				targets = ["Non-rel_pattern_k","Dippedcone"];
			}
			Breeder.setupBreedingOptions(cats, targets, true, sixPercent, gen, gen, brisk);
			//Breeder.togglePureMuta();
			Breeder.advancedBreedingLoop();

		} else if(pureMutaGen2){
			console.log("In gen 2 pure muta");
			var Breeder = require("breeder")(upper_wallet_address, web3,ck_contract);
			Breeder.setupBreedingOptions(cats, targeted_traits, unchained, sixPercent, 2, 2);
			Breeder.togglePureMuta();
			Breeder.advancedBreedingLoop();
		} else if(pureMutaGen3){
			console.log("In gen 3 pure muta");
			var Breeder = require("breeder")(upper_wallet_address, web3,ck_contract);
			Breeder.setupBreedingOptions(cats, targeted_traits, unchained, sixPercent, 3, 3);
			Breeder.togglePureMuta();
			Breeder.advancedBreedingLoop();
		} else if(pureMutaGen1){
			console.log("In gen 1 pure muta");
			var Breeder = require("breeder")(upper_wallet_address, web3,ck_contract);
			Breeder.setupBreedingOptions(cats, targeted_traits, unchained, sixPercent, 1, 1);
			Breeder.togglePureMuta();
			Breeder.advancedBreedingLoop();
		} else if(pureMutaGen0){
			console.log("In gen 0 pure muta");
			var Breeder = require("breeder")(upper_wallet_address, web3,ck_contract);
			Breeder.setupBreedingOptions(cats, targeted_traits, unchained, sixPercent, 0, 0);
			Breeder.togglePureMuta();
			Breeder.advancedBreedingLoop();
		} else {
			/*
			var Breeder = require("breeder")(upper_wallet_address, web3,ck_contract);
			Breeder.setupBreedingOptions(cats, targeted_traits, unchained, sixPercent, 999, 2);
			Breeder.advancedBreedingLoop();
			*/
			console.log("In normal generational loop");

			for(var x = 1; x <= generations_breeding_upper_limit; x++ ){
				var Breeder = require("breeder")(upper_wallet_address, web3,ck_contract);
				Breeder.setupBreedingOptions(cats, targeted_traits, unchained, sixPercent, x, x, brisk);
				console.log("Breeding generation number:" + x);
				Breeder.advancedBreedingLoop();
			}
		}

	} else {
		Breeder.breedingLoop(cats, ck_contract);
	}
	cats = [];
	allFilteredCats = [];

}

function triggerGen1Breed(cats, traitCombo, unchained, sixPercent, Breeder){
	Breeder.setupBreedingOptions(cats, traitCombo, unchained, sixPercent, 0, 0);
	Breeder.advancedBreedingLoop();
}

function checkForUnchained(args){
	let unchained = false;
	let mandatoryUnchain = ["Alien","Koala","Verdigris","Trioculus","Wolfgrey","Dali","Flamingo","Dippedcone","Cheeky","Dippedcone","Starstruck"];
	for(let unVar in mandatoryUnchain){
		unVar = mandatoryUnchain[unVar];
		if(unVar == args[2]){
			unchained = true;
			console.log("Set unchained?");
		}
	}
	return unchained;
}

function checkForSixPercent(args){
	let sixPercent = false;
	let sixPercenters = ["Flamingo","Cerulian","Wolfgrey","Sweetmeloncakes","Dali","Koala","Starstruck","Cheeky"];
	for(var sixVar in sixPercenters){
		sixVar = sixPercenters[sixVar];
		if(sixVar == args[2]){
			sixPercent = true;
			console.log("Set six percent");
		}
	}
	return sixPercent;
}

function gen0Breeder(listOfTargetedTraitCombinations, mandatoryUnchain, PremierMutations, cats, sixPercenters, Breeder){

	for(var traitCombo in listOfTargetedTraitCombinations){
		unchained = false;
		var count = traitCombo;
		var sixPercent = false;
		traitCombo = listOfTargetedTraitCombinations[traitCombo];
		console.log(traitCombo);
		if(mandatoryUnchain.includes(traitCombo)){
			unchained = true;
		}
		if(sixPercenters.includes(traitCombo)){
			sixPercent = true;
		}

		if(mandatoryUnchain.includes(args[2])){
			unchained = true;
		}

		if(sixPercenters.includes(args[2])){
			sixPercent = true;
		}
		nbdList = [];
		//setTimeout(triggerGen0Breed, 50000*count, cats, PremierMutations[traitCombo], unchained, sixPercent, Breeder);
		setTimeout(triggerGen0Breed, 50000*count, cats, traitCombo, unchained, sixPercent, Breeder);

	}

}

function triggerGen0Breed(cats, traitCombo, unchained, sixPercent, Breeder){
	Breeder.setupBreedingOptions(cats, traitCombo, unchained, sixPercent, 0, 0);
	Breeder.advancedBreedingLoop();
}

function fetch(id){
	console.log("Fetching " + id);
	return Promise.delay(2000, id).then(CKClient.getUserKitties(owner_wallet_address,64,id*20)
		.then(handleKittensWithContract, noKittensToHandle));
}

function loopGetUserKitties(err, res){
	var promiseArray = []
	array = new Array();
	//Most likely only need last 1000 cats or so, the rest is already present.
	for (i = 0; i < amountOfCalls; i++) {
    	array[i] = i;
	}
	return Promise.map(array, fetch, {concurrency: 2});
}

function doFilterWork(cat,address){
	if(address == upper_wallet_address){
		allFilteredCats.push(cat);
		console.log(cat);
	}

}

function getOwnershipOfCatsLoop(cats){
	return cats.reduce(function(promise, cat) {
		return promise.then(function(){
			return ck_contract.methods.ownerOf(cat).call().then(doFilterWork.bind(null, cat));
		});
	}, Promise.resolve());
}

var allFilteredAuctions = [];
var allFilteredCatsB = [];
var forSaleAddress = "0xb1690C08E213a35Ed9bAb7B318DE14420FB57d8C";

function doClockFilterWork(cat,address){
	if(address['seller'] == cryptokitties_contract_address){
		allFilteredCatsB.push(cat);
		console.log(cat);
	}
}

function doSaleFilterWork(cat,address){
	if(address == forSaleAddress){
		allFilteredCats.push(cat);
		console.log(cat);
	}
}

function getClockOwnershipOfCatsLoop(no_cats){
	return allFilteredCats.reduce(function(promise, cat) {
		return promise.then(function(){
			return sale_contract.methods.getAuction(cat).call().then(doClockFilterWork.bind(null, cat));
		});
	}, Promise.resolve());
}

function getCatForSaleLoop(cats){
	return cats.reduce(function(promise, cat) {
		return promise.then(function(){
			return ck_contract.methods.ownerOf(cat).call().then(doSaleFilterWork.bind(null, cat));
		});
	}, Promise.resolve());
}

function checkOwnershipOfCats(cats_bad){
	var promiseArray = [];
	for(var cat in cats){
		counter = cat;
		cat = cats[cat];
		promiseArray[counter] = ck_contract.methods.ownerOf(cat.id).call().then(doFilterWork.bind(null,cat));
	}
	return Promise.all(promiseArray).catch(console.log("Cat owner lookup failed somewhere:("));
}



function loopGetUserKittensNAPI(number){
	var totalSupply = number;
	console.log("total supply is: " + totalSupply);
	var lowGenCatsOnly = false;
	if(args[2] == "all-gen0"){
		return Utilities.readKittensFromDisk("kittensGeneration",0,0);
		console.log("low gen only!");
		lowGenCatsOnly = true;
	}

	if(args[2] == "all-gen1"){
		return Utilities.readKittensFromDisk("kittensGeneration",1,1);
		console.log("low gen only!");
		lowGenCatsOnly = true;
	}

	if(args[2] == "all-gen0PM"){
		kittens = Utilities.readKittensFromDisk("kittensGeneration",0,0);
		for(var x = totalSupply-10000; x < totalSupply; x++){

			kittens.push(x);
		}
		return kittens;
	}

	if(args[2] == "all-gen1PM"){
		kittens = Utilities.readKittensFromDisk("kittensGeneration",1,1);
		for(var x = totalSupply-10000; x < totalSupply; x++){

			kittens.push(x);
		}
		return kittens;
	}

	if(args[2] == "all-gen2PM"){
		kittens = Utilities.readKittensFromDisk("kittensGeneration",2,2);
		for(var x = totalSupply-10000; x < totalSupply; x++){

			kittens.push(x);
		}
		return kittens;
	}


	if(args[3] == "low"){
		console.log("low gen only");
		lowGenCatsOnly = true;
	}

	if(args[3] == "one-gen1"){
		console.log("low gen only");
		lowGenCatsOnly = true;
	}

	if(args[2] == "fancy"){

		var kittens =  Utilities.readKittensFromDisk("kittensGeneration",0,20);
		for(var x = 750000; x < totalSupply; x++){

			kittens.push(x);
		}
		return kittens;
	}

	if(args[2] == "find_sire"){
		var kittens = Utilities.readKittensFromDisk("kittensGeneration",0,0);

		for(var x = totalSupply - 2000; x < totalSupply; x++){
			kittens.push(x);
		}

		return kittens;
	}
	if(args[2] == "fancy2"){

		var kittens =  Utilities.readKittensFromDisk("kittensGeneration",1,20);

		for(var x = totalSupply-10000; x < totalSupply; x++){

			kittens.push(x);
		}
		return kittens;
	}

	if(args[3] == "one-gen0"){
		var kittens = Utilities.readKittensFromDisk("kittensGeneration",0,0);
		for(var x = totalSupply-1000; x < totalSupply; x++){

			kittens.push(x);
		}

		return kittens;
	}
	if(args[3] == "one-gen1"){
		var kittens = Utilities.readKittensFromDisk("kittensGeneration",1,1);
				for(var x = totalSupply-10000; x < totalSupply; x++){

			kittens.push(x);
		}

		return kittens;
	}

	if(args[2] == "diamondchase"){
		var kittens = [];
		if(args[3] == "0"){
			kittens = Utilities.readKittensFromDisk("kittensGeneration",0,0);
		} else if (args[3] == "1"){
			kittens = Utilities.readKittensFromDisk("kittensGeneration",1,1);
		} else if (args[3] == "2"){
			kittens = Utilities.readKittensFromDisk("kittensGeneration",2,2);
		} else if (args[3] == "3"){
			kittens = Utilities.readKittensFromDisk("kittensGeneration",3,3);
		} else if (args[3] == "4"){
			kittens = Utilities.readKittensFromDisk("kittensGeneration",4,4);
		} else if (args[3] == "5"){
			kittens = Utilities.readKittensFromDisk("kittensGeneration",5,5);
		} else if (args[3] == "6"){
			kittens = Utilities.readKittensFromDisk("kittensGeneration",6,6);

		} else if (args[3] == "7"){
			kittens = Utilities.readKittensFromDisk("kittensGeneration",7,7);
		} else if (args[3] == "8"){
			kittens = Utilities.readKittensFromDisk("kittensGeneration",8,8);
		} else if (args[3] == "9"){
			kittens = Utilities.readKittensFromDisk("kittensGeneration",9,9);
		}
		
		for(var x = totalSupply-2000; x < totalSupply; x++){
			kittens.push(x);
		}

		return kittens;
	}

	if(args[2] == "loadPairs"){
		let text = fs.readFileSync(__dirname + '/kitten_pairs/saved_breeding_pairs.txt', 'utf8');
		let splitText = text.split("END,");
		var pairs = [];
		for(var textEntry in splitText){
			newSplit = splitText[textEntry].split(",");
			bp = new BreedingPair(newSplit[0],newSplit[1],newSplit[2]);
			pairs.push(bp);
			console.log(bp);
		}
		return pairs;
	}
	if(args[3] == "one-gen2"){
		var kittens = Utilities.readKittensFromDisk("kittensGeneration",2,2);
		for(var x = totalSupply-1000; x < totalSupply; x++){

			kittens.push(x);
		}

		return kittens;
	}

	if(lowGenCatsOnly){
		return Utilities.readKittensFromDisk("gen0Merged", 0, 4);
		//return Utilities.readKittensFromDisk("kittensMerged",1,1); //12 is latest

	} else {
		let kittens = Utilities.readKittensFromDisk("kittensMerged",0,16); //12 is latest
		console.log("total supply is: " + totalSupply);

		//for(var x = 717000; x < 729402; x++){
		for(var x = 1; x < 739046; x++){

			kittens.push(x);
		}
		return kittens;
	}

	return splitText;
}

//var totalSupply = 717000;

var allFilteredCats = [];

function getCatsLoop(no_catArray){
	return allFilteredCats.reduce(function(promise, cat) {
		return promise.then(function(){
			return ck_contract.methods.getKitty(cat).call().then(doWork.bind(null, cat));
		});
	}, Promise.resolve());
}

function getSireCatsLoop(no_catArray){
	return allFilteredCats.reduce(function(promise, cat) {
		return promise.then(function(){
			return ck_contract.methods.getKitty(cat).call().then(doWorkSire.bind(null, cat));
		});
	}, Promise.resolve());
}

var allFilteredSireAuctions = [];
var allFilteredCatsB = [];
var forSireAddress = "0xC7af99Fe5513eB6710e6D5f44F9989dA40F27F26";

//Test output
var offset = 0;
for(v = 0; v <=1; v++){
	setTimeout(main,60000000*v);
	console.log("Scheduling: " + v);
}
function BreedingPair(id1, id2, score){
	this.id1 = id1;
	this.id2 = id2;
	this.score = score;
}

function main(){

	if(args[2] == "clock"){
		starter();

	} else if (args[2] == "find_sire"){
		ck_contract.methods.totalSupply().call().then(loopGetUserKittensNAPI).then(getOwnershipOfCatsLoop).then(getCatsLoop).then(starter_siring);

	} else if (args[2] == "loadPairs"){
		var pairs = loopGetUserKittensNAPI(44);
		breedOnly(pairs);
	}else if(api_calls_on){
		loopGetUserKitties().then(mainFunction);
	} else {
		offset += 8;
		ck_contract.methods.totalSupply().call().then(loopGetUserKittensNAPI).then(getOwnershipOfCatsLoop).then(getCatsLoop).then(mainFunction);
		//getOwnershipOfCatsLoop(kittens).then(getCatsLoop).then(mainFunction);
	}
}

function breedOnly(pairs){
	var Breeder = require("breeder")(upper_wallet_address, web3,ck_contract);
	Breeder.directBreedFromInput(pairs);
}

function kittenTotalInterjection(){

}
function buyFromClock(kittenTotal){
	kittens = []
	console.log(kittenTotal);
	for(var x = kittenTotal-50; x < kittenTotal; x++ ){
		kittens.push(x);
	}

	getCatForSaleLoop(kittens).then(getClockOwnershipOfCatsLoop).then(buyACat);

}

function buyACat(){
	//catToBidOn = allFilteredCatsB[0];
	//allFilteredCatsB = allFilteredCatsB.slice(0,5);
//	ck_contract.methods.bid(catToBidOn)
	console.log(allFilteredCatsB);
	//console.log(catToBidOn);
	//console.log(sale_contract.methods);
	for(var clockCat in allFilteredCatsB){
		console.log(Object.prototype.toString.call(allFilteredCatsB[clockCat]));
		sale_contract.methods.bid(allFilteredCatsB[clockCat]).send({from: web3.eth.defaultAccount, value: web3.utils.toWei("0.8", "ether"),gasPrice: web3.utils.toWei("0.000000050", "ether"),gas:1000000 });
	}
	//sale_contract.methods.bid(catToBidOn).send({from: web3.eth.defaultAccount, value: web3.utils.toWei("0.2", "ether"),gasPrice: web3.utils.toWei("0.000000018", "ether") });

}
function starter(){
	ck_contract.methods.totalSupply().call().then(buyFromClock);
}

function starter_siring(){
	ck_contract.methods.totalSupply().call().then(browseSires);
}

function getSireOwnershipOfCatsLoop(){

}
function browseSires(kittenTotal){
	kittens = [];
	console.log(kittenTotal);
	for(var x = 1; x < kittenTotal; x++){
		kittens.push(x);
	}

	getCatForSireLoop(kittens).then(getSireCatsLoop).then(getCatsLoop).then(findAppropriateSires);
}

function findAppropriateSires(){
	//By this point cats should be filled with your own cats and sireCats should be filled with all sireable cats. 
	var generation = 0;

	var Breeder = require("breeder")(upper_wallet_address, web3,ck_contract);
	Breeder.setupBreedingOptions(sireCats, ["Lemonade","Ruroh"], unchained, sixPercent, 0, 0, false);
	var generationZeroSires = Breeder.separateByGeneration();

	var Breeder = require("breeder")(upper_wallet_address, web3,ck_contract);
	Breeder.setupBreedingOptions(cats, ["Lemonade","Ruroh"], unchained, sixPercent, 0, 0, false);
	var generationZeroMatrons = Breeder.separateByGeneration();

	var GeneDecoder = require("genedecoder")();

	function pureMutationChaser()){
		var partner = undefined;

		self.copyOfCats = generationZeroSires;
		for(var cat in generationZeroMatrons){
			//cat = self.cats[cat];
			console.log("At cat number:" + cat);
			nCat = generationZeroMatrons[cat]];
			mutationUnordered = self._makeMutationScoreDictionarySingularHC(catDictionary[nCat.id], self.copyOfCats, catDictionary);
			mutationOrdered = self._getSortedArrayOfScoredMutaCatsFromDictionary(mutationUnordered);
			self._printFive(mutationOrdered);
			if( mutationOrdered.length != 0){
				partner = catDictionary[mutationOrdered[0][0]];
				if((self.isValidMatch(nCat, partner)) && (mutationOrdered[0][1] > 0.5)){
					console.log("is valid?");
				} else {
					partner = undefined;
				}
			}
			if(partner != undefined){
				Utilities.remove(self.copyOfCats, partner.id);
				Utilities.remove(self.copyOfCats, nCat.id);
				Utilities.remove(self.cats, nCat.id);
				Utilities.remove(self.cats, partner.id);
				//self.usedCats.push(nCat.id);
				//self.usedCats.push(partner.id);
				//self._removeBreedingPairFromAllTraitLists(nCat, partner, self.targetedTraits);
				nCat = catDictionary[nCat.id];
				self._decideBreedOrderAndPush(nCat, partner, catDictionary, mutationOrdered[0][1]);

				console.log("Found match in PURE MUTATION mode!");
				console.log("Match ids are: " + nCat.id + " and " + partner.id + "!");
				//console.log("Match had the score --> : " + scoredCat.score + " , " + scores[partner.id].score);
				/*
				var bpscore = [];
				bpscore.push(scoredCat.score);
				bpscore.push(scores[partner.id].score);
				self.breedingPairScores.push(bpscore);
				*/
			}
		}

		//self.breedingPairs = self._getSortedArrayOfScoredBreedingPairsFromDictionary(self.breedingPairs);
		self.breedingPairs.sort(Comparators.keyComparator("score"));

		self.breedingPairs = self.breedingPairs.slice(0,30);
		console.log(self.breedingPairs);
		
	}
}



function doSireFilterWork(cat,address){
	if(address['seller'] == cryptokitties_contract_address){
		allFilteredCatsB.push(cat);
		console.log(cat);
	}
}

function doSaleFilterWork(cat,address){
	if(address == forSireAddress){
		allFilteredCats.push(cat);
		console.log(cat);
	}
}

function doWorkSire(id, kitten){
	kitten.id = id;
	kitten.chanceOfTrait = {};
	if(kitten.genes){
		if(!Utilities.contains(cats, kitten)){
			sireCats.push(kitten);
		}
	}
	return kitten;

}


function getClockOwnershipOfCatsLoop(no_cats){
	return allFilteredCats.reduce(function(promise, cat) {
		return promise.then(function(){
			return sale_contract.methods.getAuction(cat).call().then(doClockFilterWork.bind(null, cat));
		});
	}, Promise.resolve());
}

function getCatForSireLoop(cats){
	return cats.reduce(function(promise, cat) {
		return promise.then(function(){
			return ck_contract.methods.ownerOf(cat).call().then(doSaleFilterWork.bind(null, cat));
		});
	}, Promise.resolve());
}
