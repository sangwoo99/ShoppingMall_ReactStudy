import React, { useState } from 'react';
import { Input } from 'antd';

const { Search } = Input;

function SearchFeature(props) {
    const [SearchTerm, setSearchTerm] = useState('');

    const changeHandler = (e) => {
        setSearchTerm(e.currentTarget.value);
        props.refreshFunction(e.currentTarget.value); // 바뀐 값 부모컴포넌트로 전달
    }

  return (
    <div>
        <Search
            placeholder="input search text"
            onChange={ changeHandler }
            style={{ width: 200 }}
            value={SearchTerm}
        />
    </div>
  )
}

export default SearchFeature