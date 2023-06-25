import {
    Ballot,
    VotingContract,
} from "@council/sdk";
import { Signer } from "ethers";
import React from "react";
import { Page } from "src/ui/base/Page";
import { useCouncil } from "src/ui/council/useCouncil";
import { useBlockNumber, useSigner } from 'wagmi'
import { useRouter } from 'next/router';

import * as proposals from './proposals'

import { CredentialType, IDKitWidget } from "@worldcoin/idkit";
import type { ISuccessResult } from "@worldcoin/idkit";

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
    ballot: 'yes',
    proposal: '',
    id: '',
})





const useFormManager = () => {
    const router = useRouter();

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

            // await votingContract.createProposal(
            //     signer as Signer,
            //     [values[ids.addressVaultContract]],
            //     [values[ids.addressTarget]],
            //     [values[ids.calldata]],
            //     lastCall,
            //     values[ids.ballot] as Ballot,
            // )

            proposals.save(values[ids.id], values[ids.proposal])

            router.push('/proposals')
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

    const [startSubmission, setStartSubmission] = React.useState(false)
    const [showForm, setShowForm] = React.useState(false);

    const isSubmitting = false
    const isSubmitSuccessful = false

    const onSuccess = (result: ISuccessResult) => {
        setShowForm(true);
		console.log("Verified")// This is where you should perform frontend actions once a user has been verified, such as redirecting to a new page


	};

const handleProof = async (result: ISuccessResult) => {
		const reqBody = {
			merkle_root: result.merkle_root,
			nullifier_hash: result.nullifier_hash,
			proof: result.proof,
			credential_type: result.credential_type,
			action: "create_proposal",
			signal: "",
		};
		fetch("/api/verify", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(reqBody),
		}).then(async (res: Response) => {
			if (res.status == 200) {
				console.log("Successfully verified credential.")
			} else {
				throw new Error("Error: " + (await res.json()).code) ?? "Unknown error.";
			}
		});
	};

    return (
        <Page>
            <h1 className="text-5xl font-bold">Create Proposal</h1>
             {!showForm && (<IDKitWidget action={"create_proposal"!} onSuccess={onSuccess} handleVerify={handleProof} app_id={"app_staging_10c3337987d9053b408f3bc93ab007fe"!} credential_types={[CredentialType.Orb, CredentialType.Phone]}>
					{({ open }) => <button onClick={open}>Verify with World ID</button>}
				</IDKitWidget>)}

            {showForm && (
            <form
                noValidate
                className="flex flex-col space-y-3 z-20"
                onSubmit={handleSubmit}
            >
                <div className='flex flex-col'>
                    <label htmlFor={ids.calldata}>Enter id</label>
                    <TextField
                        {...getFieldProps(ids.id)}
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

                <div>
                    <footer>
                        <div className='flex justify-end mb-4'>
                            {<button
                                type='submit'
                                className={
                                    'daisy-btn daisy-btn-primary '.concat(
                                        isSubmitting
                                            ? 'opacity-50'
                                            : 'opacity-95 hover:opacity-100'
                                    )
                                }
                                disabled={isSubmitting || isSubmitSuccessful}
                            >{isSubmitSuccessful ? 'Sent' : 'Submit'}</button>}
                        </div>
                    </footer>
                </div>
            </form>
            )}
            {
                // startSubmission
            }
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