import React from 'react'
import { Button, Descriptions } from 'antd';
import { useDispatch } from 'react-redux';
import { addToCart } from '../../../../_actions/user_actions';

function ProductInfo(props) {
    // 리덕스: dispatch했을때 actions동작 => reducer동작 => 전역에 저장됨
    const dispatch = useDispatch();

    const clickHandler = () => {
        // 필요한 정보를 카트 필드에다 넣어준다.
        dispatch(addToCart(props.detail._id));
    };

  return (
    <div>
        <Descriptions title="Product Info">
            <Descriptions.Item label="Price">{props.detail.price}</Descriptions.Item>
            <Descriptions.Item label="Sold">{props.detail.sold}</Descriptions.Item>
            <Descriptions.Item label="View">{props.detail.views}</Descriptions.Item>
            <Descriptions.Item label="Description">{props.detail.description}</Descriptions.Item>
        </Descriptions>

        <br/>
        <br/>
        <br/>

        <div style={{ display: 'flex', justyfyContent: 'center' }}>
            <Button size='large' shape='round' type='danger' onClick={ clickHandler }>
                Add to Cart
            </Button>
        </div>
    </div>
  )
}

export default ProductInfo