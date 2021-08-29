// buy_2_get_1_free, 1 (egg)

// cart = [];
// egg, 3, buy_2_get_1_free

// cart.forEach((element) => {
//     result = orm(offer.exist && offer.productId == egg);
//     if (result) {
//         offserParcel();
//     }
// });

// [
//     {
//         itemId: egg
//         count: 3
//         coupon: ''
//     },
//     {
//         itemId: bread
//         count: 3
//         coupon: ''
//     }
// ]

// offerParcel(offerKey, productAmount, productCount) {
//     switch offerKey {
//         case buy_2_get_1_free:
//             const chargeCount = productCount - Math.floor(productCount/3);
//             const chargeAmount = chargeCount * productAmount
//             return chargeAmount;
//         break;
//         case buy_1_get_half_off:
//             const halfCount = Math.floor(productCount/2);
//             const chargeCount = productCount - halfCount;
//             const chargeAmount = (chargeCount * productAmount) + (halfCount * (productAmount / 2));
//             return chargeAmount;
//         break;
//     }
// }
