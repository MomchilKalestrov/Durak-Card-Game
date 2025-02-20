import React from 'react';
import './input.css';

type InputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'style' | 'type' | 'placeholder' | 'className'> & {
    type: 'text' | 'password' | 'email' | 'number' | 'url';
}; 

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    (props, ref) => (
        <div className='FormInput'>
            <input { ...props } ref={ ref } placeholder=' ' />
            <label>{ props.name }</label>
        </div>
    )
);

export default Input;