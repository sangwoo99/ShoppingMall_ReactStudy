import React, { useState } from 'react';
import { Collapse, Checkbox } from 'antd';
const { Panel } = Collapse;

function CheckBox(props) {

    const [Checked, setChecked] = useState([]);

    const handleToggle = (value) => {
        // 누른 것의 Index를 구하고
        let currentIndex = Checked.indexOf(value);
        let newChecked =  [...Checked]; // 원본 조작 방지를 위해 새 배열 만듬

        // 전체 checked된 State에서 현재 누른 Checkbox가 이미 있다면
        if( currentIndex > -1 ) { // indexof: 해당값이 없을때 -1을 반환
            // 빼주고
            newChecked.splice(currentIndex, 1); // 해당 값이 존재해 해당 값 제거
            setChecked(newChecked);

        } else {
            // State에 넣어준다.
            newChecked = [...Checked, value];
            setChecked(newChecked); 
            // setChecked([...Checked, value]); //이건 왜 안되지?
            // newChecked.push(value); //이게 제일 자연스럽긴함

        }  

        // setChecked(newChecked);// 변화된 걸 다시 넣어주는걸 잊지말자.
        props.handleFilters(newChecked); // 부모 컴포넌트로 state을 보내기 위함
    };

    const renderCheckboxLists = () => 
        props.list && props.list.map((value, index) => (
            <React.Fragment key={index}>
                <Checkbox onChange={() => handleToggle(value._id)} checked={Checked.indexOf(value._id) === -1 ? false : true} />
                    <span>{value.name}</span>
            </React.Fragment>
        ))
    // 화살표함수: return을 생략하면 중괄호도 생략

  return (
    <div>  
        <Collapse defaultActiveKey={['0']} >
            <Panel header="Continents" key="1">
                { renderCheckboxLists() }             
            </Panel>
        </Collapse>
  </div>
  )
}

export default CheckBox