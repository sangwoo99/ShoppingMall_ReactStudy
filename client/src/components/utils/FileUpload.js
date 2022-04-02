import React, { useState } from 'react';
import Dropzone from 'react-dropzone';
import { Icon } from 'antd';
import axios from 'axios';

function FileUpload(props) {
    const [Images, setImages] = useState([]);
    
    const dropHandler = (files) => {
        let formData = new FormData();   
        const config = {
            header: { 'content-type': 'multipart/form-data' }
        };
        formData.append("file", files[0]);

        // formData와 config를 안보내면 에러가 발생
        axios.post('/api/product/image', formData, config)
            .then(response => {
                if (response.data.success) {
                    console.log(response.data);
                    setImages([...Images, response.data.filePath]);
                    props.refreshFunction([...Images, response.data.filePath]); // 상위컴포넌트에 state전달
                } else {
                    alert('파일을 저장하는데 실패했습니다.');
                }
            })
    };

    const deletehandler = (image) => {
        const currentIndex = Images.indexOf(image);

        let newImages = [...Images]; // 제거나 추가를 할때 원본배열을 직접 수정하지 않고 새로 만들어서 한다.
        newImages.splice(currentIndex, 1); // 넣어준 인덱스로부터 1개를 지워준다.(splice 중간지점부터 제거나 추가할때 씀)
        
        setImages(newImages);
        props.refreshFunction(newImages);
    };

// JSX는 최상위 div는 하나만 있어야함
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Dropzone onDrop={dropHandler}>
            {({ getRootProps, getInputProps }) => (
                <div style={{ width: 300, height: 240, border: '1px solid lightgray',
                display: 'flex', alignItems: 'center', justifyContent: 'center'}}
                {...getRootProps()}>
                    <input {...getInputProps()} />
                    <Icon type="plus" style={{ fontSize: '3rem' }} />
                </div>
            )}
        </Dropzone>

        <div style={{ display: 'flex', width: '350px', height: '240px', overflowX: 'scroll'}}>
                {
                    Images.map((image, index) => (
                        <div onClick={() => deletehandler(image)} key={index}>
                            <img style={{ minWidth: '300px', width: '300px', height: '240px' }}
                                src={`http://localhost:5000/${image}`}/>
                        </div>
                    ))
                }
        </div>
    </div>
  )
}

export default FileUpload

