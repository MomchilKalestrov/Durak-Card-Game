import React from 'react';

import './button.css';

type ButtonProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'style'> & {
    border?: boolean | undefined;
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ border = true, children, ...rest }, ref) => (
    <button
        ref={ ref } { ...rest }
        className={ `Button ${ border ? 'ButtonBorder' : '' }` }
    >{children}</button>
));

export default Button;