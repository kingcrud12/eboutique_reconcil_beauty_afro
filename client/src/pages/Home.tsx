import React from 'react'
import Hero from '../components/Hero'
import Testimony from '../components/Testimony'
import Product from '../components/Product'

function home() {
  return (
    <div>
      <Hero/>
      <Product/>
      <Testimony/>
    </div>
  )
}

export default home