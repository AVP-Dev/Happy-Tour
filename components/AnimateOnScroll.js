import { useInView } from 'react-intersection-observer';
import { useEffect, useState } from 'react';

const AnimateOnScroll = ({ children }) => {
    const { ref, inView } = useInView({
        threshold: 0.1,
        triggerOnce: true,
    });
    
    const [hasAnimated, setHasAnimated] = useState(false);

    useEffect(() => {
        if (inView) {
            setHasAnimated(true);
        }
    }, [inView]);

    return (
        <div ref={ref} className={`fade-in-up ${hasAnimated ? 'visible' : ''}`}>
            {children}
        </div>
    );
};

export default AnimateOnScroll;
