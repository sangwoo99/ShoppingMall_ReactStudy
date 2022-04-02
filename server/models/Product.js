const { Schema } = require('mongoose');
const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    writer: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    title: {
        type: String,
        maxlength: 50,
    },
    description: {
        type: String,
    },
    price: {
        type: Number,
        default: 0
    },
    images: {
        type: Array,
        default: []
    },
    sold: {
        type: Number,
        maxlength: 100,
        default: 0
    },
    continents: {
        type: Number,
        default: 1
    },
    views: {
        type: Number,
        default: 0
    }
}, { timestamps: true}); // 자동으로 등록시간,업데이트 시간이 등록됨

productSchema.index({ // 검색시 우선 탐색하게 설정
    title: 'text',
    description: 'text'
}, {
    weights: {
        title: 5,
        description: 1
    }
})


const Product = mongoose.model('Product', productSchema);

module.exports = { Product };