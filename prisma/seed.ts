import { Facing, DesignStatus, FileType, Role } from '@prisma/client'
import { prisma } from '../src/lib/prisma'

async function main() {
  // 1. Create Admin User
  const admin = await prisma.user.upsert({
    where: { email: 'admin@moryadesigns.com' },
    update: {},
    create: {
      email: 'admin@moryadesigns.com',
      name: 'Admin User',
      passwordHash: 'dummy_hash_for_testing', // In production, this would be a bcrypt hash
      role: Role.ADMIN,
      phone: '+919876543210'
    },
  })
  console.log(`Created admin user: ${admin.email}`)

  // 2. Insert 12 Realistic House Plan Designs

  // Design 1: Modern 3BHK Villa
  const villa = await prisma.design.upsert({
    where: { slug: 'modern-3bhk-villa' },
    update: {},
    create: {
      title: 'Modern 3BHK Villa',
      slug: 'modern-3bhk-villa',
      description: 'A spacious and modern 3BHK villa designed for comfortable family living. Features an open-plan living area, a large master suite, and a dedicated parking space. The exterior boasts a contemporary facade with large windows for natural light.',
      category: 'Villa',
      styleTags: ['Modern', 'Contemporary', 'Spacious'],
      plotWidthFt: 40,
      plotLengthFt: 60,
      plotAreaSqft: 2400,
      builtUpAreaSqft: 1800,
      floors: 2,
      bhk: 3,
      facing: Facing.E,
      priceInr: 15000,
      status: DesignStatus.PUBLISHED,
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
            isPrimary: true,
            sortOrder: 0,
            altText: 'Modern 3BHK Villa Exterior'
          },
          {
            url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
            isPrimary: false,
            sortOrder: 1,
            altText: 'Modern 3BHK Villa Interior'
          }
        ]
      },
      files: {
        create: [
          {
            fileType: FileType.DWG,
            storageKey: 'deliverables/dummy-villa-plan.dwg',
            sizeBytes: 2500000
          },
          {
            fileType: FileType.PDF,
            storageKey: 'deliverables/dummy-villa-plan.pdf',
            sizeBytes: 1500000
          }
        ]
      }
    }
  })
  console.log(`Created design: ${villa.title}`)

  // Design 2: Compact 2BHK House Plan
  const compact = await prisma.design.upsert({
    where: { slug: 'compact-2bhk-house-plan' },
    update: {},
    create: {
      title: 'Compact 2BHK House Plan',
      slug: 'compact-2bhk-house-plan',
      description: 'An efficient and budget-friendly 2BHK house plan suitable for small plots. Maximizes space utilization without compromising on aesthetics. Ideal for urban settings.',
      category: 'House Plan',
      styleTags: ['Compact', 'Budget', 'Minimalist'],
      plotWidthFt: 30,
      plotLengthFt: 40,
      plotAreaSqft: 1200,
      builtUpAreaSqft: 950,
      floors: 1,
      bhk: 2,
      facing: Facing.N,
      priceInr: 8000,
      status: DesignStatus.PUBLISHED,
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
            isPrimary: true,
            sortOrder: 0,
            altText: 'Compact 2BHK House Exterior'
          }
        ]
      },
      files: {
        create: [
          {
            fileType: FileType.PDF,
            storageKey: 'deliverables/dummy-compact-plan.pdf',
            sizeBytes: 1200000
          }
        ]
      }
    }
  })
  console.log(`Created design: ${compact.title}`)

  // Design 3: Luxury Duplex Design
  const luxury = await prisma.design.upsert({
    where: { slug: 'luxury-duplex-design' },
    update: {},
    create: {
      title: 'Luxury Duplex Design',
      slug: 'luxury-duplex-design',
      description: 'A premium luxury duplex design featuring state-of-the-art amenities, a private garden space, and double-height living areas. Perfect for a lavish lifestyle.',
      category: 'Duplex',
      styleTags: ['Luxury', 'Premium', 'Modern'],
      plotWidthFt: 50,
      plotLengthFt: 80,
      plotAreaSqft: 4000,
      builtUpAreaSqft: 3500,
      floors: 2,
      bhk: 4,
      facing: Facing.W,
      priceInr: 35000,
      status: DesignStatus.PUBLISHED,
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
            isPrimary: true,
            sortOrder: 0,
            altText: 'Luxury Duplex Exterior'
          }
        ]
      },
      files: {
        create: [
          {
            fileType: FileType.DWG,
            storageKey: 'deliverables/dummy-duplex.dwg',
            sizeBytes: 4500000
          },
          {
            fileType: FileType.THREE_D,
            storageKey: 'deliverables/dummy-duplex-3d.zip',
            sizeBytes: 15000000
          }
        ]
      }
    }
  })
  console.log(`Created design: ${luxury.title}`)

  // Design 4: Compact 1BHK Cottage Plan
  const cottage = await prisma.design.upsert({
    where: { slug: 'compact-1bhk-cottage-plan' },
    update: {},
    create: {
      title: 'Compact 1BHK Cottage Plan',
      slug: 'compact-1bhk-cottage-plan',
      description: 'A charming and highly efficient 1BHK cottage plan. Features a cozy living space, a compact kitchen, and a lovely front porch. Excellent choice for vacation homes or narrow plots.',
      category: 'House Plan',
      styleTags: ['Compact', 'Cottage', 'Eco-friendly'],
      plotWidthFt: 25,
      plotLengthFt: 35,
      plotAreaSqft: 875,
      builtUpAreaSqft: 750,
      floors: 1,
      bhk: 1,
      facing: Facing.W,
      priceInr: 6000,
      status: DesignStatus.PUBLISHED,
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
            isPrimary: true,
            sortOrder: 0,
            altText: 'Compact 1BHK Cottage Exterior'
          }
        ]
      },
      files: {
        create: [
          {
            fileType: FileType.PDF,
            storageKey: 'deliverables/dummy-cottage-plan.pdf',
            sizeBytes: 900000
          }
        ]
      }
    }
  })
  console.log(`Created design: ${cottage.title}`)

  // Design 5: Traditional Indian House Plan
  const traditional = await prisma.design.upsert({
    where: { slug: 'traditional-indian-house-plan' },
    update: {},
    create: {
      title: 'Traditional Indian House Plan',
      slug: 'traditional-indian-house-plan',
      description: 'A timeless architectural plan inspired by traditional Indian courtyards and verandas. Vastu-compliant spaces ensure healthy airflow and abundant daylight throughout the single-floor design.',
      category: 'Traditional',
      styleTags: ['Traditional', 'Vastu', 'Courtyard'],
      plotWidthFt: 45,
      plotLengthFt: 55,
      plotAreaSqft: 2475,
      builtUpAreaSqft: 1600,
      floors: 1,
      bhk: 3,
      facing: Facing.E,
      priceInr: 12000,
      status: DesignStatus.PUBLISHED,
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
            isPrimary: true,
            sortOrder: 0,
            altText: 'Traditional Indian House Exterior'
          }
        ]
      },
      files: {
        create: [
          {
            fileType: FileType.DWG,
            storageKey: 'deliverables/dummy-traditional.dwg',
            sizeBytes: 2800000
          }
        ]
      }
    }
  })
  console.log(`Created design: ${traditional.title}`)

  // Design 6: Contemporary Urban House
  const contemporary = await prisma.design.upsert({
    where: { slug: 'contemporary-urban-house' },
    update: {},
    create: {
      title: 'Contemporary Urban House',
      slug: 'contemporary-urban-house',
      description: 'An elegant 3-story contemporary home optimized for high-density urban streets. Offers a double-height lounge, private rooftop terrace, and a modern open kitchen layout.',
      category: 'Contemporary',
      styleTags: ['Contemporary', 'Urban', 'Multi-floor'],
      plotWidthFt: 35,
      plotLengthFt: 45,
      plotAreaSqft: 1575,
      builtUpAreaSqft: 2800,
      floors: 3,
      bhk: 3,
      facing: Facing.N,
      priceInr: 18000,
      status: DesignStatus.PUBLISHED,
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
            isPrimary: true,
            sortOrder: 0,
            altText: 'Contemporary Urban House Exterior'
          }
        ]
      },
      files: {
        create: [
          {
            fileType: FileType.DWG,
            storageKey: 'deliverables/dummy-contemporary.dwg',
            sizeBytes: 3100000
          }
        ]
      }
    }
  })
  console.log(`Created design: ${contemporary.title}`)

  // Design 7: Compact Urban House Plan
  const compactUrban = await prisma.design.upsert({
    where: { slug: 'compact-urban-house-plan' },
    update: {},
    create: {
      title: 'Compact Urban House Plan',
      slug: 'compact-urban-house-plan',
      description: 'Optimized 2-story footprint for narrow plots. Features an integrated carport, smart under-stair storage, and a private rear balcony layout.',
      category: 'House Plan',
      styleTags: ['Compact', 'Urban', 'Minimalist'],
      plotWidthFt: 20,
      plotLengthFt: 40,
      plotAreaSqft: 800,
      builtUpAreaSqft: 1400,
      floors: 2,
      bhk: 2,
      facing: Facing.S,
      priceInr: 9000,
      status: DesignStatus.PUBLISHED,
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
            isPrimary: true,
            sortOrder: 0,
            altText: 'Compact Urban House Exterior'
          }
        ]
      },
      files: {
        create: [
          {
            fileType: FileType.PDF,
            storageKey: 'deliverables/dummy-compact-urban.pdf',
            sizeBytes: 1100000
          }
        ]
      }
    }
  })
  console.log(`Created design: ${compactUrban.title}`)

  // Design 8: Premium Family Home
  const familyHome = await prisma.design.upsert({
    where: { slug: 'premium-family-home' },
    update: {},
    create: {
      title: 'Premium Family Home',
      slug: 'premium-family-home',
      description: 'A grand 4BHK family duplex. Designed with dual family living spaces, modular utility utility areas, and a massive lawn connection facade.',
      category: 'Duplex',
      styleTags: ['Duplex', 'Premium', 'Vastu'],
      plotWidthFt: 40,
      plotLengthFt: 60,
      plotAreaSqft: 2400,
      builtUpAreaSqft: 2800,
      floors: 2,
      bhk: 4,
      facing: Facing.E,
      priceInr: 22000,
      status: DesignStatus.PUBLISHED,
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
            isPrimary: true,
            sortOrder: 0,
            altText: 'Premium Family Home Exterior'
          }
        ]
      },
      files: {
        create: [
          {
            fileType: FileType.DWG,
            storageKey: 'deliverables/dummy-family.dwg',
            sizeBytes: 4200000
          }
        ]
      }
    }
  })
  console.log(`Created design: ${familyHome.title}`)

  // Design 9: Modern Bungalow Plan
  const bungalow = await prisma.design.upsert({
    where: { slug: 'modern-bungalow-plan' },
    update: {},
    create: {
      title: 'Modern Bungalow Plan',
      slug: 'modern-bungalow-plan',
      description: 'A classic modern bungalow layout. Generous setback spaces, spacious bedrooms with walk-in dressers, and a premium double car parking port.',
      category: 'Bungalow',
      styleTags: ['Bungalow', 'Premium', 'Modern'],
      plotWidthFt: 50,
      plotLengthFt: 70,
      plotAreaSqft: 3500,
      builtUpAreaSqft: 3200,
      floors: 2,
      bhk: 4,
      facing: Facing.N,
      priceInr: 28000,
      status: DesignStatus.PUBLISHED,
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
            isPrimary: true,
            sortOrder: 0,
            altText: 'Modern Bungalow Exterior'
          }
        ]
      },
      files: {
        create: [
          {
            fileType: FileType.PDF,
            storageKey: 'deliverables/dummy-bungalow.pdf',
            sizeBytes: 1900000
          }
        ]
      }
    }
  })
  console.log(`Created design: ${bungalow.title}`)

  // Design 10: Luxury Villa retreat
  const luxuryVilla = await prisma.design.upsert({
    where: { slug: 'luxury-villa-retreat' },
    update: {},
    create: {
      title: 'Luxury Villa Retreat',
      slug: 'luxury-villa-retreat',
      description: 'An ultimate 5BHK luxury getaway layout. Floor-to-ceiling glass screens, integrated private pool decks, and double height structural architectural lines.',
      category: 'Villa',
      styleTags: ['Villa', 'Luxury', 'Contemporary'],
      plotWidthFt: 60,
      plotLengthFt: 90,
      plotAreaSqft: 5400,
      builtUpAreaSqft: 5200,
      floors: 2,
      bhk: 5,
      facing: Facing.W,
      priceInr: 45000,
      status: DesignStatus.PUBLISHED,
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
            isPrimary: true,
            sortOrder: 0,
            altText: 'Luxury Villa Retreat Exterior'
          }
        ]
      },
      files: {
        create: [
          {
            fileType: FileType.THREE_D,
            storageKey: 'deliverables/dummy-luxury-villa.zip',
            sizeBytes: 25000000
          }
        ]
      }
    }
  })
  console.log(`Created design: ${luxuryVilla.title}`)

  // Design 11: Urban Duplex Plan
  const urbanDuplex = await prisma.design.upsert({
    where: { slug: 'urban-duplex-plan' },
    update: {},
    create: {
      title: 'Urban Duplex Plan',
      slug: 'urban-duplex-plan',
      description: 'Sleek, efficient duplex layout focusing on optimized floor heights. Dual master bedrooms, premium balconies, and Vastu-compliant kitchen placements.',
      category: 'Duplex',
      styleTags: ['Duplex', 'Urban', 'Vastu'],
      plotWidthFt: 30,
      plotLengthFt: 50,
      plotAreaSqft: 1500,
      builtUpAreaSqft: 2200,
      floors: 2,
      bhk: 3,
      facing: Facing.S,
      priceInr: 16000,
      status: DesignStatus.PUBLISHED,
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
            isPrimary: true,
            sortOrder: 0,
            altText: 'Urban Duplex Exterior'
          }
        ]
      },
      files: {
        create: [
          {
            fileType: FileType.DWG,
            storageKey: 'deliverables/dummy-urban-duplex.dwg',
            sizeBytes: 3600000
          }
        ]
      }
    }
  })
  console.log(`Created design: ${urbanDuplex.title}`)

  // Design 12: Modern 1BHK Apartment Layout
  const appt = await prisma.design.upsert({
    where: { slug: 'modern-1bhk-apartment-layout' },
    update: {},
    create: {
      title: 'Modern 1BHK Apartment Layout',
      slug: 'modern-1bhk-apartment-layout',
      description: 'A compact and modern layout designed to fit single floor units or independent studio cottages. Includes space-saving convertible options.',
      category: 'House Plan',
      styleTags: ['Compact', 'Minimalist', 'Budget'],
      plotWidthFt: 20,
      plotLengthFt: 30,
      plotAreaSqft: 600,
      builtUpAreaSqft: 500,
      floors: 1,
      bhk: 1,
      facing: Facing.E,
      priceInr: 5000,
      status: DesignStatus.PUBLISHED,
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
            isPrimary: true,
            sortOrder: 0,
            altText: 'Modern 1BHK Apartment Exterior'
          }
        ]
      },
      files: {
        create: [
          {
            fileType: FileType.PDF,
            storageKey: 'deliverables/dummy-apartment.pdf',
            sizeBytes: 800000
          }
        ]
      }
    }
  })
  console.log(`Created design: ${appt.title}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
