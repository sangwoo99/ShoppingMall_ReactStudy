const express = require('express');
const router = express.Router();
const { User } = require("../models/User");
const { auth } = require("../middleware/auth");
const { Product } = require('../models/Product');
const { Payment } = require('../models/Payment');
const async = require('async');

//=================================
//             User
//=================================

router.get("/auth", auth, (req, res) => {
    res.status(200).json({
        _id: req.user._id,
        isAdmin: req.user.role === 0 ? false : true,
        isAuth: true,
        email: req.user.email,
        name: req.user.name,
        lastname: req.user.lastname,
        role: req.user.role,
        image: req.user.image,
        cart: req.user.cart,
        history: req.user.history,
    });
});

router.post("/register", (req, res) => {

    const user = new User(req.body);

    user.save((err, doc) => {
        if (err) return res.json({ success: false, err });
        return res.status(200).json({
            success: true
        });
    });
});

router.post("/login", (req, res) => {
    User.findOne({ email: req.body.email }, (err, user) => {
        if (!user)
            return res.json({
                loginSuccess: false,
                message: "Auth failed, email not found"
            });

        user.comparePassword(req.body.password, (err, isMatch) => {
            if (!isMatch)
                return res.json({ loginSuccess: false, message: "Wrong password" });

            user.generateToken((err, user) => {
                if (err) return res.status(400).send(err);
                res.cookie("w_authExp", user.tokenExp);
                res
                    .cookie("w_auth", user.token)
                    .status(200)
                    .json({
                        loginSuccess: true, userId: user._id
                    });
            });
        });
    });
});

router.get("/logout", auth, (req, res) => {
    User.findOneAndUpdate({ _id: req.user._id }, { token: "", tokenExp: "" }, (err, doc) => {
        if (err) return res.json({ success: false, err });
        return res.status(200).send({
            success: true
        });
    });
});

router.post("/addToCart", auth, (req, res) => {
    
    // 먼저 User Collection에서 해당 정보를 가져오기
    User.findOne({ _id : req.user._id}, // auth에서 user정보를 req.user에 넣어 놓아있기 때문에 바로 사용가능
        (err, userInfo) => {
            // 가져온 정보에서 카트에다 넣으려는 상품이 이미 들어 있는지 확인
            let duplicate = false;

            userInfo.cart.forEach((item) => {
                if(item.id === req.body.productId) {
                    duplicate = true;
                }       
            })

            console.log('duplicate', duplicate);

            if(duplicate) {
                // 상품이 이미 있을 때
                User.findOneAndUpdate(
                    { _id: req.user._id, "cart.id": req.body.productId },
                    { $inc: { "cart.$.quantity": 1} }, // inc는 increment
                    { new: true }, // 업데이트 된 정보를 다시 받을 때 필요한 조건
                    (err, userInfo) => {
                        if(err) return res.status(400).json({ success: false, err})
                        res.status(200).send(userInfo.cart)
                    }
                )
            } else {
                // 상품이 이미 있지 않을 때
                User.findOneAndUpdate(
                    { _id: req.user._id }, // 해당 조건으로 찾고
                    {
                        $push: {  // 해당 값을 넣어 업데이트 해준다.
                            cart: {
                                id: req.body.productId,
                                quantity: 1,
                                date: Date.now()
                            }
                        }
                    },
                    { new: true },
                    (err, userInfo) => {
                        if(err) return res.status(400).json({ success: false, err })
                        res.status(200).send(userInfo.cart)
                    }
                )
            }

        })
    
    
});

router.get("/removeFromCart", auth, (req, res) => {
    // 먼저 cart안에 내가 지우려고 한 상품을 지워주기
    User.findOneAndUpdate(
        { _id: req.user._id },
        {
            $pull: {  // 지울 땐 $pull, 넣을 땐 $push
                'cart': { 'id': req.query.id}
            }
        },
        { new: true },
        (err, userInfo) => {
            let cart = userInfo.cart;
            let array = cart.map(item => {
                return item.id
            })

            // product collection에서 제거 뒤 현재 남아있는 상품들의 정보를 가져오기
            Product.find({ _id: { $in: array }})
                .populate()
                .exec((err, productInfo) => {
                    return res.status(200).json({
                        productInfo,
                        cart
                    })
                })
        }

    )

});

router.post("/successBuy", auth, (req, res) => {
    
    // 1. User Collection 안에 History 필드 안에 간단한 결제 정보 넣어주기
    let history = [];
    let transactionData = {};

    req.body.cartDetail.forEach((item) => {
        history.push({
            dateOfPurchase: Date.now(),
            name: item.title,
            id: item._id,
            price: item.price,
            quantity: item.quantity,
            paymentId: req.body.paymentData.paymentID
        })
    })
    // 2. Payment Collection 안에 자세한 결제 정보들을 넣어주기
    transactionData.user = {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email
    };

    transactionData.data = req.body.paymentData;
    transactionData.product = history;

    // history 정보 저장
    User.findOneAndUpdate(
        { _id: req.user._id },
        { $push: { history: history }, $set: { cart: [] } }, // 새로 컬럼추가할 때 $push, 이미 있는 걸 수정할땐 $set
        { new: true },
        (err, user) => {
            if(err) return res.json({ success: false, err })

            // payment에다가 transactionData정보 저장
            const payment = new Payment(transactionData);
            payment.save((err, doc) => {
                if(err) return res.json({ success: false, err })

                // 3. Product Collection안에 있는 sold 필드 정보 업데이트 시켜주기

                // 상품당 몇개의 quantity를 샀는지

                let products = [];
                doc.product.forEach(item => {
                    products.push({ id: item.id, quantity: item.quantity })
                })


                async.eachSeries(products, (item, callback) => {
                    Product.update(
                        { _id: item.id },
                        {
                            $inc: { // $inc 수량증가
                                "sold": item.quantity  
                            }
                        },
                        { new: false },
                        callback
                    )

                }, (err) => {
                    if(err) return res.status(400).json({ success: false, err })
                    res.status(200).json({
                        success: true,
                        cart: user.cart,
                        cartDetail: []
                    })
                })
            })
        }
    );

});
    

module.exports = router;
