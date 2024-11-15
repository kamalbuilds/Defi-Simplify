import useMemoizedAddressLabel from '@/hooks/useMemoizedAddressLabel';
import React from 'react';

const AddressLabel = ({
    address,
    character = 6
}: {
    address: string
    character: number
}) => {
    const addressLabel = useMemoizedAddressLabel(address, character)
    return (
        <div className='flex flex-row items-center gap-1'>
            <span>{addressLabel}</span>
        </div>
    );
};

export default AddressLabel;