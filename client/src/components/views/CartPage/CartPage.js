import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux';
import { getCartItems, removeCartItem, onSuccessBuy } from '../../../_actions/user_actions'; // function일때 중괄호 잊지 말기
import UserCardBlock from './Sections/UserCardBlock';
import Paypal from '../../utils/Paypal';
import { Empty, Result } from 'antd';

function CartPage(props) {
    const dispatch = useDispatch();

    const [Total, setTotal] = useState(0);
    const [ShowTotal, setShowTotal] = useState(false);
    const [ShowSuccess, setShowSuccess] = useState(false);

    useEffect(() => {

        let cartItems = [];
        // 리덕스 User state안에 cart안에 상품이 들어있는지 확인
        if(props.user.userData && props.user.userData.cart && props.user.userData.cart.length > 0) {
            cartItems = props.user.userData.cart.map((item) => {
                return item.id;
            });

            dispatch(getCartItems(cartItems, props.user.userData.cart))
                .then(response => { calculateTotal(response.payload) })
        }
        
    }, [props.user.userData])
    
    const calculateTotal = (cartDetail) => {
        let total = 0;
        cartDetail.map(item => {
            total += parseInt(item.price, 10) * item.quantity
        })
        
        setTotal(total);
        setShowTotal(true);
    }
    
    const removeFromCart = (productId) => {
        dispatch(removeCartItem(productId))
            .then(response => {
                if(response.payload.productInfo.length <= 0) {
                    setShowTotal(false)
                }
            });
    };

    const transactionSuccess = (data) => {
        dispatch(onSuccessBuy({
            paymentData: data,
            cartDetail: props.user.cartDetail
        }))
        .then(response => {
            if(response.payload.success) {
                setShowTotal(false)
                setShowSuccess(true)
            }
        })
    }

  return (
    <div style={{ width: '85%', margin: '3rem auto' }}>
        <h1>My Cart</h1>
        <div>
            <UserCardBlock products={props.user.cartDetail} removeItem={removeFromCart}/>
        </div>

        { ShowTotal 
            ?   <div style={{ marginTop: '3rem' }}>
                    <h2>Total Amount: ${Total}</h2>
                </div>
            : ShowSuccess 
                ?   <Result
                        status="success"
                        title="Successfully Purchased Items!"
                    /> 
                :   <>
                        <br/>
                        <Empty description={false}/>
                    </>
        }

        { ShowTotal && <Paypal total={Total} onSuccess={transactionSuccess}/> }

        

    </div>
  )
}

export default CartPage