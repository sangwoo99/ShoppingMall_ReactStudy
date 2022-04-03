import React, { useState, useEffect } from 'react'
import ImageGallery from 'react-image-gallery';

function ProductImage(props) {

    const [Images, setImages] = useState([]);

    useEffect(() => {

        if(props.detail.images && props.detail.images.length > 0) { // 객체나 배열에서 값 존재여부 판단할때 씀
            let images = props.detail.images.map(item => {
                return {
                    original: `http://localhost:5000/${item}`,
                    thumbnail: `http://localhost:5000/${item}`
                }
            });

            setImages(images);
        }

    }, [props.detail]); // props.detail이 바뀔때마다 동작, 처음엔 없다가 나중에 생겨서 재랜더링한 것
    

    const images = [
        {
          original: 'https://picsum.photos/id/1018/1000/600/',
          thumbnail: 'https://picsum.photos/id/1018/250/150/',
        },
        {
          original: 'https://picsum.photos/id/1015/1000/600/',
          thumbnail: 'https://picsum.photos/id/1015/250/150/',
        },
        {
          original: 'https://picsum.photos/id/1019/1000/600/',
          thumbnail: 'https://picsum.photos/id/1019/250/150/',
        },
      ];

  return (
    <div>
        <ImageGallery items={Images}/>
    </div>
  )
}

export default ProductImage