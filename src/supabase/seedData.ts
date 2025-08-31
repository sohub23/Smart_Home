import { productService } from './products'

export const seedProducts = async () => {
  const products = [
    {
      name: 'Zemismart Tuya 2 Gang',
      category: 'Smart Switch',
      price: 3500,
      stock: 25,
      status: 'Active',
      description: 'Smart WiFi touch wall switch with 2 gang control, works with Alexa and Google Home',
      image: '/images/smart_switch/one gang.webp'
    },
    {
      name: 'Zemismart Tuya 3 Gang',
      category: 'Smart Switch',
      price: 3850,
      stock: 18,
      status: 'Active',
      description: '3 gang smart touch switch with WiFi connectivity and voice control support',
      image: '/images/smart_switch/3 gang mechanical.webp'
    },
    {
      name: 'Zemismart Zigbee 2 Gang',
      category: 'Smart Switch',
      price: 3500,
      stock: 0,
      status: 'Out of Stock',
      description: 'Zigbee protocol smart switch with 2 gang control and mesh network support',
      image: '/images/smart_switch/3 gang mechanical fan.webp'
    },
    {
      name: 'Zemismart 4 Gang',
      category: 'Smart Switch',
      price: 3500,
      stock: 0,
      status: 'Out of Stock',
      description: '4 gang smart touch switch with advanced control features',
      image: '/images/smart_switch/4 gang touch light.webp'
    },
    {
      name: 'Sonoff 4-gang WiFi',
      category: 'Smart Switch',
      price: 2199,
      stock: 12,
      status: 'Active',
      description: 'Affordable 4-gang WiFi smart switch with reliable performance',
      image: '/images/smart_switch/fan touch switch.webp'
    },
    {
      name: 'Smart Sliding Curtain',
      category: 'Smart Curtain',
      price: 36000,
      stock: 8,
      status: 'Active',
      description: 'Automated sliding curtain system with WiFi control and silent motor operation',
      image: '/assets/hero-sliding-curtain.jpg'
    },
    {
      name: 'Smart Roller Curtain',
      category: 'Smart Curtain',
      price: 13000,
      stock: 15,
      status: 'Active',
      description: 'Compact roller curtain with smart motor and precise positioning control',
      image: '/assets/hero-roller-curtain.jpg'
    },
    {
      name: 'Sohub Protect SP 01',
      category: 'Security',
      price: 8500,
      stock: 6,
      status: 'Active',
      description: 'Advanced security system with smart monitoring capabilities',
      image: '/assets/gallery-1.jpg'
    },
    {
      name: 'Sohub Protect SP 05',
      category: 'Security',
      price: 12500,
      stock: 4,
      status: 'Low Stock',
      description: 'Premium security solution with enhanced features and connectivity',
      image: '/assets/gallery-2.jpg'
    },
    {
      name: 'PDLC Smart Film',
      category: 'Film',
      price: 15000,
      stock: 10,
      status: 'Active',
      description: 'Privacy glass film that switches from transparent to opaque with smart control',
      image: '/assets/window.jpeg'
    }
  ]

  try {
    for (const product of products) {
      await productService.createProduct(product)
      console.log(`Added: ${product.name}`)
    }
    console.log('All products seeded successfully!')
  } catch (error) {
    console.error('Error seeding products:', error)
  }
}