const express = require('express');
const router = express.Router();
const multer = require('multer');
const { Product } = require('../models/Product');

//=================================
//             Product
//=================================

const storage = multer.diskStorage({
    // 업로드한 파일이 저장되는 파일경로
    destination: function (req, file, cb) {
      cb(null, 'uploads/')
    },
    // 저장할때 명시할 대상 파일의 이름
    filename: function (req, file, cb) {
      cb(null, `${Date.now()}_${file.originalname}` )
    }
  });
  
const upload = multer({ storage: storage }).single('file');

router.post('/image', (req, res) => {
    // 가져온 이미지를 저장
    upload(req, res, err => { //신기하게 파라미터 3개인데도 소괄호 안씀
        if(err) {
            return res.json({ success: false, err});
        }
        return res.json({ success: true, filePath: res.req.file.path, fileName: res.req.file.filename });
    })
});

router.post('/', (req, res) => {
    // 받아온 정보를 DB에 넣어준다.
    const product = new Product(req.body);

    product.save((err) => {
        if(err) return res.status(400).json({ success: false, err });
        return res.status(200).json({ success: true });
    })

});

router.post('/products', (req, res) => {
  //product collection에 들어 있는 모든 상품 정보를 가져오기
  //post로 던지면 req.body로 받는다.
  let limit = req.body.limit ? parseInt(req.body.limit) : 20;
  let skip = req.body.skip ? parseInt(req.body.skip) : 0;
  let term = req.body.searchTerm

  let findArgs = {};

  for(let key in req.body.filters ) { // object이라서 배열함수 못씀, key값만 하나씩 가져옴
    
    if(req.body.filters[key].length > 0) { // object빈값 체크 object.length 이용
      if(key === 'price') {
        findArgs[key] = {
          $gte: req.body.filters[key][0], // 몽고DB 크거나 같을때(greater than eaual)
          $lte: req.body.filters[key][1]  // 몽고DB 작거나 같을때(less than eaual)
        }
      } else {
        findArgs[key] = req.body.filters[key]; // 새로운 object를 만들어 값들을 넣는다.
      } 
    }
  }

  console.log('findArgs', findArgs);

  if(term) {

    Product.find(findArgs)
    .find({ $text: { $search: term }})
    .populate('writer')
    .skip(skip) // 가져올 데이터 시작 위치 
    .limit(limit) // 한번에 가져올 갯수
    .exec((err, productInfo) => {
      if(err) return res.status(400).json({ success: false, err });
      return res.status(200).json({ success: true, productInfo, postSize: productInfo.length });
    })

  } else {

    Product.find(findArgs)
      .populate('writer')
      .skip(skip) // 가져올 데이터 시작 위치 
      .limit(limit) // 한번에 가져올 갯수
      .exec((err, productInfo) => {
        if(err) return res.status(400).json({ success: false, err });
        return res.status(200).json({ success: true, productInfo, postSize: productInfo.length });
      })

  }

});

router.get('/product_by_id', (req, res) => {

  let type = req.query.type;
  let productIds = req.query.id;

  if(type === 'array') {
    let ids = req.query.id.split(','); // 여러개 들어온 상품 id를 쪼개서 배열로
    productIds = ids.map(item => {
      return item
    });
  }

  console.log('productIds', productIds);
  // productId를 이용해서 DB에서 productId와 같은 상품의 정보를 가져온다.

  Product.find({ _id: { $in: productIds } }) // $in을 이용하면 배열을 넣어 각각 요소들에 해당하는 정보를 모두 가져옴 
    .populate('writer')
    .exec((err, product) => {
      if(err) return res.status(400).send(err)
      return res.status(200).send(product)
    })

});


module.exports = router;
