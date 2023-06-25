const PROPOSAL = 'PROPOSAL'

export const save = (id: string, title: string) => {
    const proposals = JSON.parse(localStorage.getItem(PROPOSAL) ?? '{}')

    const proposal = {
        id,
        title,
        status: 'IN PROGRESS',
        created: new Date(),
    }

    localStorage.setItem(PROPOSAL, JSON.stringify({ ...proposals, ...({ [id]: proposal, }), }))
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
            id => (proposals[id])
        )
}
