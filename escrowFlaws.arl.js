
// An escrow Smart Contract is a contract that helps a buyer and a seller make a transaction, where the buyer pays some number of tokens in exchange for an item.
// We start with a situation where a buyer and seller at different locations, have agreed on a price, for the sale and shipment of an item.
// The goal is to make sure the process goes smoothly, so that:
// The buyer only gets the item if he pays for it
// The seller only gets the money once the buyer receives the item

// Here are the steps:
// 1. The seller originates the contract and provides the initial storage: his address, the buyer address, and the price.
// 2. The buyer pays the agreed upon price by calling the pay entry point
// 3. Off-chain, the seller sends the purchased item
// 4. The buyer confirms the reception of the item, by calling the confirm entry point
// 5. The seller withdraws the money, through the claim entry point 
// Your goal is to find the flaws with this contract, and think about ways to fix them.
// JSLigo:
// type storage = { seller: address, buyer: address, price: tez, paid: bool, confirmed: bool };
// type action = | ["Pay"] | ["Confirm"] | ["Claim"];
// type tReturn = [list<operation>, storage];

// let pay = (s: storage) : tReturn => {
//    if (Tezos.sender != s.buyer) {
//       return failwith("Pas l'acheteur") as tReturn;
//    } else if (Tezos.amount != s.price) {
//       return failwith("Pas le bon prix") as tReturn;
//    } else if (s.paid) {
//       return failwith("Deja paye !") as tReturn;
//    } else {
//       return [list([]) as list<operation>, {...s, paid: true }];
//    }
// };

// let confirm = (s: storage) : tReturn => {
//    if (Tezos.sender != s.buyer) {
//       return failwith("Pas l'acheteur") as tReturn;
//    } else if (!s.paid) {
//       return failwith("Pas paye") as tReturn;
//    } else if (s.confirmed) {
//       return failwith("Deja confirme") as tReturn;
//    } else {
//       return [list([]) as list<operation>, {...s, confirmed: true }];
//    }
// };

// let claim = (s: storage) : tReturn => {
//    if (Tezos.sender != s.seller) {
//       return failwith("Pas le vendeur") as tReturn;
//    } else if (!s.confirmed) {
//       return failwith("Pas confirme") as tReturn;
//    } else {
//        let contractOpt = Tezos.get_contract_opt (Tezos.sender) as option<contract<unit>>;
//        let receiver: contract<unit> = match (contractOpt, {
//            Some: (contract : any) => contract,
//            None: () => failwith("Contract not found.") as contract<unit>
//        });
//        let op : operation = Tezos.transaction(unit, Tezos.balance, receiver);
//        return [list([op]), s];
//    }
// };
    
// let main = ([p,s] : [action, storage]) : tReturn => {
//     return match(p, {
//       Pay : () => pay(s),
//       Confirm : () => confirm(s),
//       Claim : () => claim(s)
//     });
// };
// SmartPy:
// import smartpy as sp

// class Escrow(sp.Contract):
//     def __init__(self, seller, buyer, price):
//         self.init(seller = seller, buyer = buyer,price = price,
// paid = False, confirmed = False)

//     @sp.entry_point
//     def pay(self):
//         sp.verify(sp.sender == self.data.buyer, "Not the buyerr")
//         sp.verify(sp.amount == self.data.price, "Not the right price")
//         sp.verify(~self.data.paid, "Already paid!")
//         self.data.paid = True

//     @sp.entry_point
//     def confirm(self):
//         sp.verify(sp.sender == self.data.buyer, "Not the buyer")
//         sp.verify(self.data.paid, "Not paid")
//         sp.verify(~self.data.confirmed, "Already confirmed")
//         self.data.confirmed = True
    
//     @sp.entry_point
//     def claim(self):
//         sp.verify(sp.sender == self.data.seller, "Not the seller")
//         sp.verify(self.data.confirmed, "Not confirmed")
//         sp.send(sp.sender, sp.balance)
// Archetype:
// archetype escrow (seller : address, buyer : address, price : tez)

// states =| Created | Paid | Confirmed

// transition pay () {
//  called by buyer
//  require { r1 : transferred = price otherwise "Pas le bon prix" }
//  from Created to Paid
// }

// transition confirm () {
//  called by buyer
//  from Paid to Confirmed
// }

// entry claim () {
//  called by seller
//  state is Confirmed
//  effect { transfer balance to caller }
// }

