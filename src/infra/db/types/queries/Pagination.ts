export type Pagination =
	| undefined
	| Partial<{
			offset: number
			limit: number
	  }>

export const defaultPagination: Pagination = {
	offset: 0,
	limit: 50,
}
