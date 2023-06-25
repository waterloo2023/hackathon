const PROPOSAL = 'PROPOSAL'

export const save = (id: string, proposal: string) => {
    const proposals = JSON.parse(localStorage.getItem(PROPOSAL) ?? '{}')
    localStorage.setItem(PROPOSAL, JSON.stringify({ ...proposals, ...{ [id]: proposal }, }))
}

export const getById = (id: string) => {
    if (localStorage.getItem(PROPOSAL) === null) {
        return null
    }

    const proposals = JSON.parse(localStorage.getItem(PROPOSAL) ?? '')
    return proposals[id]
}

export const getList = () => {
    if (localStorage.getItem(PROPOSAL) === null) {
        return []
    }

    const proposals = JSON.parse(localStorage.getItem(PROPOSAL) ?? '')
    return Object.keys(proposals)
        .map(
            id => ({
                id,
                title: proposals[id],
                status: 'IN PROGRESS',
            })
        )
}
