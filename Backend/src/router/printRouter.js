const express = require("express");
const router = express.Router();
const PrintingOrder = require("../models/PrintingOrder");
const userAuth = require("../middleware/userAuth");
const PrintingOrder = require("../models/PrintingOrder");
const Order = require("../models/Order");

// Example helper: calculate price
function calculatePrice(order) {
    let pricePerPage = order.color ? 2 : 1;  // sample pricing
    let totalPrice = pricePerPage * order.numberOfPages * order.copies;
    return totalPrice;
}

router.post("/print-order",userAuth,async (req, res) => {
    try {

        const printingOrder = await PrintingOrder.create({
            userId: req.user._id,       
            fileUrl: req.body.fileUrl,
            numberOfPages: req.body.numberOfPages,
            color: req.body.color,
            copies: req.body.copies,
            side: req.body.side,
            paperSize: req.body.paperSize,
            binding: req.body.binding,
            instruction: req.body.instruction
        });

        const totalPrice = calculatePrice(printingOrder);

        const order = await Order.create({
            userId: printingOrder.userId,
            items: [{
                productId: printingOrder._id, 
                quantity: printingOrder.copies,
                price: totalPrice
            }],
            totalAmount: totalPrice,
            orderStatus: "pending",
            paymentStatus: "pending"
        });

        // 4. Update PrintingOrder with orderId
        printingOrder.orderid = order._id;
        await printingOrder.save();

        res.status(201).json({
            success: true,
            message: "Printing order & stationary order created successfully",
            printingOrder,
            order
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: err.message });
    }
});

router.get("/print-order/:id", userAuth, async (req, res) => {
    try {
        const printingOrder = await PrintingOrder.findById(req.params.id).populate("userId", "name email");
        if (!printingOrder) {
            return res.status(404).json({ success: false, message: "Printing order not found" });
        }
        res.status(200).json({ success: true, printingOrder });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;