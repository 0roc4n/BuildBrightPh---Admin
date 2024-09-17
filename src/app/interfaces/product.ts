export  {Product , Variants}

interface Product {
  description   : string
  discount      : string
  metaKeyword   : string
  item_code     : string
  name          : string
  in_stock     ?: number
  category      : string
  user          : string
  image         : string
  variants     ?: Variants[]
}

interface Variants {
  variant_name : string
  price        : number
  in_stock     : number
}

