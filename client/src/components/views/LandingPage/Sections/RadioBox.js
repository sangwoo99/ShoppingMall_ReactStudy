import React, { useState } from 'react';
import { Collapse, Radio } from 'antd';
const { Panel } = Collapse;

function RadioBox(props) {
    const [Value, setValue] = useState(0);

    const renderRadioboxLists = () =>  {  // 중괄호쓰면 return꼭 써야하고 아니면 둘다 생략
        return props.list && props.list.map((value) => ( //JSX를 리턴할땐 ()소괄호로 감싸야함, {}와 return이 생략됨
                <Radio key={value._id} value={value._id}>
                    <span>{value.name}</span>
                </Radio>
        ))
    };

    const handleChange = (e) => {
        setValue(e.target.value); // target: 자식요소인 span태그의 값을 가져온다.
        props.handleFilters(e.target.value);
    };


  return (
    <div>
        {/* defaultActiveKey이 1이면 자동 펼침 */}
        <Collapse defaultActiveKey={['0']} >
            <Panel header="Price" key="1">
                <Radio.Group onChange={handleChange} value={Value}>
                    { renderRadioboxLists() }             
                </Radio.Group>
            </Panel>
        </Collapse>
    </div>
  )
}

export default RadioBox