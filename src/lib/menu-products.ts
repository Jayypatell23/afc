// Shared between the menu page's initial server-side fetch and the client-side
// pagination in MenuSection, so both request exactly the same shape of data.
export const MENU_PRODUCT_FIELDS =
  "id,title,handle,description,thumbnail,*images,*variants,*categories,+variants.calculated_price,+variants.inventory_quantity"

// Products per page, both for the initial SSR page and each "Load more" click.
export const MENU_PAGE_SIZE = 12
