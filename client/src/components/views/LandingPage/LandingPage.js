import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Icon, Col, Row, Card } from 'antd';
import Meta from 'antd/lib/card/Meta';
import ImageSlider from '../../utils/ImageSlider';
import CheckBox from './Sections/CheckBox';
import RadioBox from './Sections/RadioBox';
import SearchFeature from './Sections/SearchFeature';
import { continents, price } from './Sections/Datas';

function LandingPage() {
    const [Products, setProducts] = useState([]);
    const [Skip, setSkip] = useState(0);
    const [Limit, setLimit] = useState(4);
    const [PostSize, setPostSize] = useState(0);
    const [Filters, setFilters] = useState({
        continents: [],
        price: []
    });
    const [SearchTerm, setSearchTerm] = useState('');

    useEffect(() => {

        let body = {
            skip: Skip,
            limit: Limit
        };

        getProducts(body);

    }, []);

    // 처음 진입시도 사용하고  더보기 눌렀을때도 사용하므로 재사용을 위해 함수로 만듬
    const getProducts = (body) => { 
        axios.post('/api/product/products', body)
        .then(response => {
            if(response.data.success) {
                console.log(response.data);
                if(body.loadMore) { // 더보기 버튼을 눌렀을 시
                    setProducts([...Products, ...response.data.productInfo]) //펼침연산자로 합치면서 새 배열 만듬
                } else {
                    setProducts(response.data.productInfo);
                }
                setPostSize(response.data.postSize);
            } else {
                alert('상품을 가져오는데 실패했습니다.');
            }
        })
    };


    const loadMoreHandler = () => {

        let skip = Skip + Limit;

        let body = {
            skip: skip,
            limit: Limit,
            loadMore: true
        };

        getProducts(body);
        setSkip(skip);
    };
    
    const renderCards = Products.map((product, index) => {
        // **antd의 반응형 웹
        //화면 전체를 24로 생각하고 분할해주면 됨
        //lg 브라우저 사이즈 가장 클 때 (웹) 24/6 = 4등분
        //mg 브라우저 사이즈 중간 크기일 때 (태블릿) 24/8 = 3등분
        //xs 브라우저 사이즈 가장 작을 때(모바일) 24/24 = 1등분
        return <Col lg={6} md={8} xs={24} key={index} >
                <Card 
                    cover={<a href={`/product/${product._id}`}><ImageSlider images={product.images} /></a>} //문자열과 합쳐서 쓸때 백틱과 ${}이용           
                >
                    <Meta
                        title={ product.title }
                        description= { `$${ product.price }` }
                    />
                </Card>
             </Col>
    });

    const showFilteredResult = (filters) => {
        let body = {
            skip: 0,
            limit: Limit,
            filters: filters
        };


        getProducts(body);
        setSkip(0);
    };

    const handlePrice = (value) => {
        const data = price;
        let array = [];

        for (let key in data) {
            if(data[key]._id === parseInt(value, 10)) {
                array = data[key].array; // 가격대 배열을 가져옴
            }
        }
        return array;

    }

    
    const handleFilters = (filters, category) => {
        
        const newFilters = {...Filters};

        newFilters[category] = filters;
        console.log(filters);

        if(category === 'price') {
            let priceValues = handlePrice(filters);
            newFilters[category] = priceValues;
        }

        showFilteredResult(newFilters);
        setFilters(newFilters);
        
    };

    const updateSearchTerm = (newSearchTerm) => {
        setSearchTerm(newSearchTerm)

        let params = {
            skip: 0,
            limit: Limit,
            filters: Filters,
            searchTerm: newSearchTerm
        };

        setSkip(0)
        getProducts(params)

    }

    return (
        <div style={{ width: '75%', margin: '3rem auto' }}>
            <div style={{ textAlign: 'center '}}>
                <h2>Let's Travel Anywhere <Icon type="rocket"/> </h2>
            </div>

            {/* Filter */}
            <Row gutter={ [16, 16] }>
                <Col lg={12} xs={24} >
                    {/* CheckBox */}
                    <CheckBox list={continents} handleFilters={filters => handleFilters(filters, 'continents')} />
                </Col>
                <Col lg={12} xs={24} >
                    {/* RadioBox */}
                    <RadioBox list={price} handleFilters={filters => handleFilters(filters, 'price')}/>
                </Col>

            </Row>

            {/* Search */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '1rem auto' }}>
               <SearchFeature
                    refreshFunction={updateSearchTerm}
               />
            </div>

            {/* Cards */}

            <Row gutter={ [16, 16] }>
                { renderCards }
            </Row>

            { 
                PostSize >= Limit &&
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <button onClick={loadMoreHandler}>더보기</button>
                    </div>
            }
        </div>
    )
}

export default LandingPage
