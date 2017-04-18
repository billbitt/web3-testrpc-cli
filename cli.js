/* load npm packages */

var inquirer = require("inquirer");
var web3 = require("web3");

/* configure web3 */

var web3_provider = "http://localhost:8545";
var _web3 = new web3();
_web3.setProvider(new web3.providers.HttpProvider(web3_provider));

/* configure my wallet */

// create variables 
var myWallet = {
    addr: ""
}
var addressesArray = [];

// get and store the addresses from the test rpc node 
_web3.eth.getAccounts(function(error, result){  
    if (error){
        console.log("error:", error);
        return;
    };
    for (var i = 0; i < result.length; i++){  // store all the addresses
        addressesArray.push(result[i]);
    };
    myWallet.addr = result[0]; // push the first address into "myWallet"
});

/* create a CLI that uses web3 */

function runCli(){  // main function that runs the CLI 
    inquirer.prompt([{
        type: "list",
        name: "action",
        message: "What action would you like to take?",
        choices: ["Get balances", "Send Ether", "Exit"]
    }]).then(function(answer){
        if (answer.action === "Get balances"){
            getAllBalances();
        } else if (answer.action === "Send Ether"){
            initiateTransaction();    
        } else if (answer.action === "Exit") {
            process.exit();
        };
    });
}

function getAllBalances(callback){ // helper function that prints all balances, then restarts the CLI 
    // get all of the account addresses
    _web3.eth.getAccounts(function(error, result){  
        if (error){  // handle errors 
            console.log("error:", error);
            return;
        };
        var balance = 0;
        for (var i = 0; i < result.length; i++){
            // for each address, get the address and the balance 
            balance = _web3.eth.getBalance(result[i])
            // log the result 
            console.log("\nAddress " + i + ": " + result[i] + "\nBalance: " + _web3.fromWei(balance, "ether") + " Ether");
        };
        runCli(); // restart the CLI
    });
}

function initiateTransaction(){  // helper function that initiates a transaction (send only, for now)
    inquirer.prompt([
        {
            type: "list",
            message: "Who are you sending to?",
            choices: addressesArray,
            name: "toAddress",
        },
        {
            message: "How much are you sending?",
            name: "sendAmount"
        }
    ]).then(function(answers){
        sendEther(answers.toAddress, myWallet.addr, answers.sendAmount)  // send ether 
    })
}

function sendEther(toAddress, fromAddress, amount){  // helper function that sends ether 
    var eth = amount * Math.pow(10, 18);
    var sendObj = {
        from: fromAddress,
        value: eth,
        to: toAddress
    };
    _web3.eth.sendTransaction(sendObj, function(error, result){
        console.log("\nRequest Completed.\nTransaction Id: " + result + "\n");
        runCli(); // restart the CLI
    });
}

/* start the cli */ 

runCli();
