export type Pagination =
	| undefined
	| Partial<{
			offset: number
			limit: number
	  }>

export const defaultPagination = {
	offset: 0,
	limit: 50,
}
