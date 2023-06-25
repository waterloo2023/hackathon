import {
    Ballot,
    VotingContract,
} from "@council/sdk";
import { Signer } from "ethers";
import React from "react";
import { Page } from "src/ui/base/Page";
import { useCouncil } from "src/ui/council/useCouncil";
import { useBlockNumber, useSigner } from 'wagmi'

const ids = Object.freeze({
    addressVotingContract: 'addressVotingContract',
    addressVaultContract: 'addressVaultContract',
    addressTarget: 'addressTarget',
    calldata: 'calldata',
    ballot: 'ballot',
    proposal: 'proposal',
    id: 'id',
})

const initialValues = Object.freeze({
    addressVotingContract: '0x71c95911e9a5d330f4d621842ec243ee1343292e',
    addressVaultContract: '0x712516e61c8b383df4a63cfe83d7701bce54b03e',
    addressTarget: '0x0000000000000000000000000000000000000000',
    calldata: '0x0000000000000000000000000000000000000000',
    ballot: 'maybe',
    proposal: '',
    id: '',
})

const useFormManager = () => {
    const { context, } = useCouncil();

    const { data: signer } = useSigner();

    const { data: blockNumber } = useBlockNumber();

    const [values, setValues] = React.useState(initialValues)

    const handleChange = React.useCallback(
        (id: keyof typeof ids) => (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.currentTarget.value
            setValues({ ...values, [id]: value })
        }, [setValues, values]
    )

    const handleSubmit = React.useCallback(
        async (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault()

            const votingContract = new VotingContract(values[ids.addressTarget], [], context);

            const currentBlock = blockNumber!;

            // const DAY_IN_SECONDS = 86400;
            // const BLOCK_TIME = 12;
            // const DAY_IN_BLOCKS = DAY_IN_SECONDS / BLOCK_TIME;
            const lastCall = currentBlock //+ DAY_IN_BLOCKS * 90;

            // debugger

            await votingContract.createProposal(
                signer as Signer,
                [values[ids.addressVaultContract]],
                [values[ids.addressTarget]],
                [values[ids.calldata]],
                lastCall,
                values[ids.ballot] as Ballot,
            )
            console.log(values)
        }, [context, signer, blockNumber, values]
    )

    const getFieldProps = (id: keyof typeof ids) => ({
        id,
        value: values[id],
        onChange: handleChange(id),
    })

    return {
        getFieldProps,
        handleSubmit,
        values,
    }
}

export default function CreateProposalPage() {
    const { getFieldProps, handleSubmit, values, } = useFormManager()
    const isSubmitting = false
    const isSubmitSuccessful = false

    return (
        <Page>
            <h1 className="text-5xl font-bold">Create Proposal</h1>

            <form
                noValidate
                className="flex flex-col space-y-3 z-20"
                onSubmit={handleSubmit}
            >
                <div className='hidden flex flex-col'>
                    <label htmlFor={ids.addressVotingContract}>Enter voting contract address</label>
                    <TextField
                        {...getFieldProps(ids.addressVotingContract)}
                        invalid={false}
                    />
                </div>
                <div className='hidden flex flex-col'>
                    <label htmlFor={ids.addressVaultContract}>Enter voting vault addresses</label>
                    <TextField
                        {...getFieldProps(ids.addressVaultContract)}
                        invalid={false}
                    />
                </div>
                <div className='hidden flex flex-col'>
                    <label htmlFor={ids.addressTarget}>Enter target addresses</label>
                    <TextField
                        {...getFieldProps(ids.addressTarget)}
                        invalid={false}
                    />
                </div>
                <div className='hidden flex flex-col'>
                    <label htmlFor={ids.calldata}>Enter call data for each target</label>
                    <TextField
                        {...getFieldProps(ids.calldata)}
                        invalid={false}
                    />
                </div>
                <div className='flex flex-col'>
                    <label htmlFor={ids.calldata}>Enter proposal</label>
                    <TextField
                        {...getFieldProps(ids.proposal)}
                        invalid={false}
                    />
                </div>
                <div className='flex flex-col'>
                    <label htmlFor={ids.calldata}>Enter id</label>
                    <TextField
                        {...getFieldProps(ids.id)}
                        invalid={false}
                    />
                </div>
                <div>
                    <footer>
                        <div className='flex justify-end mb-4'>
                            <button
                                type='submit'
                                className={
                                    'daisy-btn daisy-btn-primary '.concat(
                                        isSubmitting
                                            ? 'opacity-50'
                                            : 'opacity-95 hover:opacity-100'
                                    )
                                }
                                disabled={isSubmitting || isSubmitSuccessful}
                            >{isSubmitSuccessful ? 'Sent' : 'Submit'}</button>
                        </div>
                    </footer>
                </div>
            </form>
        </Page>
    )
}

const TextField = (props: { invalid: boolean } & React.InputHTMLAttributes<HTMLInputElement>) => {
    const { className, invalid, ...attributes } = props

    return (
        <input
            {...attributes}
            type='text'
            autoComplete='off'
            aria-invalid={invalid ? 'true' : 'false'}
            className={invalid ? 'ring-1 ring-red-600 border-red-600 '.concat(className ?? '') : className}
        />
    )
}