import { Dish, Cook, Order, UserProfile } from '../types';

export const MOCK_USERS: Record<string, UserProfile> = {
  customer: {
    id: 'user_cust_01',
    name: 'Nguyễn Thuỳ Chi',
    email: 'thuychi.nguyen@gmail.com',
    phone: '0908 123 456',
    role: 'customer',
    address: 'Toà Landmark 3, Vinhomes Central Park, P. 22, Q. Bình Thạnh, TP.HCM',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  },
  cook: {
    id: 'cook_01',
    name: 'Cô Bích Huệ',
    email: 'bichhue.chef@gmail.com',
    phone: '0912 345 678',
    role: 'cook',
    address: '142 Bạch Đằng, P. 24, Q. Bình Thạnh, TP.HCM',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
  },
  admin: {
    id: 'admin_01',
    name: 'HomeMeal Quản Trị',
    email: 'admin@homemeal.vn',
    phone: '1900 6868',
    role: 'admin',
    address: 'Văn phòng HomeMeal, 68 Nguyễn Huệ, Quận 1, TP.HCM',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
  }
};

export const MOCK_DISHES: Dish[] = [
  {
    id: 'dish_01',
    name: 'Thịt kho tàu trứng cút dừa tươi',
    vietnameseName: 'Thịt kho tàu nước dừa',
    category: 'meat',
    description: 'Thịt ba rọi rút sườn kho mềm tan với nước dừa xiêm Bến Tre, trứng cút ngấm vị cánh gián đậm đà, chuẩn vị mâm cơm Nam Bộ.',
    suggestedPortion: '3-4 người',
    complexity: 'moderate',
    estimatedCost: 135000,
    prepTimeMinutes: 50,
    dietaryTags: ['Đậm vị', 'Món truyền thống', 'Thịt sạch VietGAP'],
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
    popular: true,
    ingredients: [
      { id: 'ing_1', name: 'Thịt ba rọi heo VietGAP', estimatedQuantity: '600', unit: 'gram', estimatedPrice: 85000 },
      { id: 'ing_2', name: 'Trứng cút tươi', estimatedQuantity: '15', unit: 'quả', estimatedPrice: 20000 },
      { id: 'ing_3', name: 'Dừa xiêm tươi', estimatedQuantity: '1', unit: 'trái', estimatedPrice: 18000 },
      { id: 'ing_4', name: 'Gia vị kho (hành, tỏi, ớt hiểm, nước mắm ngon)', estimatedQuantity: '1', unit: 'phần', estimatedPrice: 12000 },
    ]
  },
  {
    id: 'dish_02',
    name: 'Canh chua cá bớp bông điên điển',
    vietnameseName: 'Canh chua cá bớp',
    category: 'soup',
    description: 'Cá bớp tươi béo ngọt nấu cùng me chín, bông điên điển, bắp chuối bào, thơm và đậu bắp giòn rụm thơm lừng rau om ngò gai.',
    suggestedPortion: '4 người',
    complexity: 'moderate',
    estimatedCost: 120000,
    prepTimeMinutes: 35,
    dietaryTags: ['Thanh mát', 'Giàu canxi & Omega-3', 'Ít dầu mỡ'],
    imageUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80',
    popular: true,
    ingredients: [
      { id: 'ing_5', name: 'Cá bớp biển tươi cắt khoanh', estimatedQuantity: '400', unit: 'gram', estimatedPrice: 75000 },
      { id: 'ing_6', name: 'Bông điên điển & Bắp chuối', estimatedQuantity: '200', unit: 'gram', estimatedPrice: 15000 },
      { id: 'ing_7', name: 'Cà chua, thơm, đậu bắp, giá đỗ', estimatedQuantity: '1', unit: 'vỉ', estimatedPrice: 18000 },
      { id: 'ing_8', name: 'Me vắt & rau om ngò gai ớt cay', estimatedQuantity: '1', unit: 'bó', estimatedPrice: 12000 },
    ]
  },
  {
    id: 'dish_03',
    name: 'Rau muống xào tỏi đập dập',
    vietnameseName: 'Rau muống xào tỏi',
    category: 'vegetable',
    description: 'Rau muống non ngắt đọt xào to lửa, giữ trọn sắc xanh mướt và độ giòn ngọt, quyện cùng tỏi cô đơn phi thơm nức mũi.',
    suggestedPortion: '3-4 người',
    complexity: 'simple',
    estimatedCost: 35000,
    prepTimeMinutes: 15,
    dietaryTags: ['Rau sạch hữu cơ', 'Xào nhanh', 'Giàu chất xơ'],
    imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
    popular: true,
    ingredients: [
      { id: 'ing_9', name: 'Rau muống nước hữu cơ non', estimatedQuantity: '1', unit: 'bó (500g)', estimatedPrice: 22000 },
      { id: 'ing_10', name: 'Tỏi cô đơn Lý Sơn & dầu hào', estimatedQuantity: '1', unit: 'phần', estimatedPrice: 13000 },
    ]
  },
  {
    id: 'dish_04',
    name: 'Cá lóc đồng kho tộ tiêu đen',
    vietnameseName: 'Cá lóc kho tộ',
    category: 'fish',
    description: 'Cá lóc đồng tươi thịt dai ngọt kho riu riu trong tộ đất, nước kho sền sệt thơm mùi tiêu chín Phú Quốc và mỡ hành.',
    suggestedPortion: '3-4 người',
    complexity: 'moderate',
    estimatedCost: 110000,
    prepTimeMinutes: 40,
    dietaryTags: ['Món dân dã', 'Đậm đà', 'Cá đồng tươi'],
    imageUrl: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80',
    popular: true,
    ingredients: [
      { id: 'ing_11', name: 'Cá lóc đồng sống làm sạch', estimatedQuantity: '500', unit: 'gram', estimatedPrice: 75000 },
      { id: 'ing_12', name: 'Mỡ heo sạch áp chảo lấy tóp', estimatedQuantity: '150', unit: 'gram', estimatedPrice: 18000 },
      { id: 'ing_13', name: 'Nước mắm nhỉ nhãn nhĩ & tiêu sọ', estimatedQuantity: '1', unit: 'phần', estimatedPrice: 17000 },
    ]
  },
  {
    id: 'dish_05',
    name: 'Gà ta hấp lá chanh da giòn',
    vietnameseName: 'Gà ta hấp lá chanh',
    category: 'meat',
    description: 'Gà thả vườn thịt săn chắc, hấp cách thủy giữ nguyên vị ngọt mộc tự nhiên, da vàng óng rắc lá chanh non the mát chấm muối tiêu chanh.',
    suggestedPortion: '4-6 người',
    complexity: 'moderate',
    estimatedCost: 190000,
    prepTimeMinutes: 45,
    dietaryTags: ['Gà thả vườn', 'Thanh đạm', 'Món cỗ & tiệc'],
    imageUrl: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=600&q=80',
    ingredients: [
      { id: 'ing_14', name: 'Gà ta thả vườn nguyên con', estimatedQuantity: '1.4', unit: 'kg', estimatedPrice: 165000 },
      { id: 'ing_15', name: 'Lá chanh tươi, gừng già, muối hột', estimatedQuantity: '1', unit: 'bộ gia vị', estimatedPrice: 25000 },
    ]
  },
  {
    id: 'dish_06',
    name: 'Tôm càng xanh hấp nước dừa xiêm',
    vietnameseName: 'Tôm càng hấp nước dừa',
    category: 'seafood',
    description: 'Tôm càng xanh loại 1 vỏ mỏng thịt chắc ngọt đậm, hấp nguyên trái dừa xiêm giữ trọn độ tươi tinh khiết.',
    suggestedPortion: '4-6 người',
    complexity: 'complex',
    estimatedCost: 280000,
    prepTimeMinutes: 30,
    dietaryTags: ['Hải sản tươi sống', 'Món tiệc sang trọng', 'Giàu canxi'],
    imageUrl: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=600&q=80',
    ingredients: [
      { id: 'ing_16', name: 'Tôm càng xanh sống loại 1', estimatedQuantity: '800', unit: 'gram', estimatedPrice: 250000 },
      { id: 'ing_17', name: 'Nước dừa xiêm & muối tiêu chanh ớt', estimatedQuantity: '1', unit: 'phần', estimatedPrice: 30000 },
    ]
  },
  {
    id: 'dish_07',
    name: 'Bò Úc lúc lắc khoai tây chiên giòn',
    vietnameseName: 'Bò lúc lắc',
    category: 'meat',
    description: 'Thăn bò mềm cắt quân cờ xào lửa lớn cùng ớt chuông ba màu, hành tây tím, sốt tiêu đen kèm khoai tây chiên vàng giòn rụm.',
    suggestedPortion: '3-4 người',
    complexity: 'moderate',
    estimatedCost: 175000,
    prepTimeMinutes: 25,
    dietaryTags: ['Thịt bò nhập khẩu', 'Trẻ em yêu thích', 'Giàu sắt'],
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
    ingredients: [
      { id: 'ing_18', name: 'Thăn bò mềm cao cấp', estimatedQuantity: '450', unit: 'gram', estimatedPrice: 130000 },
      { id: 'ing_19', name: 'Ớt chuông Đà Lạt & hành tây', estimatedQuantity: '300', unit: 'gram', estimatedPrice: 25000 },
      { id: 'ing_20', name: 'Khoai tây & sốt bơ tỏi', estimatedQuantity: '1', unit: 'phần', estimatedPrice: 20000 },
    ]
  },
  {
    id: 'dish_08',
    name: 'Đậu hũ non sốt nấm đông cô chay',
    vietnameseName: 'Đậu hũ sốt nấm chay',
    category: 'vegetarian',
    description: 'Đậu hũ trứng non mềm mịn sốt cùng nấm hương, nấm rơm tươi và dầu hào chay thanh khiết, rắc ngò gai thơm dịu.',
    suggestedPortion: '3-4 người',
    complexity: 'simple',
    estimatedCost: 60000,
    prepTimeMinutes: 20,
    dietaryTags: ['Món thuần chay', 'Ít calo', 'Thanh lọc cơ thể'],
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
    ingredients: [
      { id: 'ing_21', name: 'Đậu hũ non tươi sạch', estimatedQuantity: '2', unit: 'hộp', estimatedPrice: 24000 },
      { id: 'ing_22', name: 'Nấm đông cô & nấm rơm tươi', estimatedQuantity: '250', unit: 'gram', estimatedPrice: 26000 },
      { id: 'ing_23', name: 'Gia vị chay cao cấp', estimatedQuantity: '1', unit: 'phần', estimatedPrice: 10000 },
    ]
  },
  {
    id: 'dish_09',
    name: 'Chè bưởi An Giang cốt dừa béo bùi',
    vietnameseName: 'Chè bưởi An Giang',
    category: 'dessert',
    description: 'Cùi bưởi Năm Roi sên giòn sần sật không chút vị đắng, đậu xanh cà xát vỏ hấp mềm tơi chan nước cốt dừa béo ngậy.',
    suggestedPortion: '4-6 người',
    complexity: 'moderate',
    estimatedCost: 55000,
    prepTimeMinutes: 40,
    dietaryTags: ['Món tráng miệng', 'Vị ngọt thanh', 'Truyền thống miền Tây'],
    imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80',
    ingredients: [
      { id: 'ing_24', name: 'Cùi bưởi sơ chế khử đắng', estimatedQuantity: '200', unit: 'gram', estimatedPrice: 20000 },
      { id: 'ing_25', name: 'Đậu xanh bóc vỏ loại 1', estimatedQuantity: '200', unit: 'gram', estimatedPrice: 18000 },
      { id: 'ing_26', name: 'Nước cốt dừa vắt nguyên chất & đường phèn', estimatedQuantity: '1', unit: 'phần', estimatedPrice: 17000 },
    ]
  },
  {
    id: 'dish_10',
    name: 'Mâm tiệc: Heo sữa quay da giòn bánh hỏi',
    vietnameseName: 'Heo quay bánh hỏi tiệc',
    category: 'banquet',
    description: 'Món tiệc trọng đại: heo quay da nổ cốm giòn rụm, mỡ mỏng thịt thơm mềm ăn kèm bánh hỏi lá hẹ, rau sống tươi và mắm nêm đậm đà.',
    suggestedPortion: '8-10 người',
    complexity: 'complex',
    estimatedCost: 550000,
    prepTimeMinutes: 90,
    dietaryTags: ['Món tiệc chính', 'Thịnh soạn', 'Phù hợp đám tiệc/cỗ'],
    imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80',
    ingredients: [
      { id: 'ing_27', name: 'Thịt heo ba chỉ quay lu giòn da', estimatedQuantity: '1.5', unit: 'kg', estimatedPrice: 420000 },
      { id: 'ing_28', name: 'Bánh hỏi tơ miến & mỡ hẹ', estimatedQuantity: '1', unit: 'kg', estimatedPrice: 65000 },
      { id: 'ing_29', name: 'Rau sống tổng hợp & nước chấm đặc chế', estimatedQuantity: '1', unit: 'mẹt', estimatedPrice: 65000 },
    ]
  }
];

export const MOCK_COOKS: Cook[] = [
  {
    id: 'cook_01',
    name: 'Cô Bích Huệ',
    title: 'Nghệ nhân mâm cơm gia đình Nam Bộ',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
    rating: 4.96,
    reviewCount: 142,
    experienceYears: 16,
    serviceAreas: ['Quận 1', 'Bình Thạnh', 'Quận 2 (Thủ Đức)', 'Phú Nhuận'],
    specialties: ['Canh chua cá kho', 'Thịt kho trứng nước dừa', 'Món mộc gia đình', 'Bữa cơm hàng ngày'],
    supportedEvents: ['Bữa cơm thường ngày', 'Bữa cơm sum họp cuối tuần', 'Mâm cỗ gia tiên nhỏ (dưới 15 người)'],
    maxGuests: 15,
    baseLaborFee: 180000,
    bio: 'Tôi có hơn 15 năm gắn bó với gian bếp gia đình và các sự kiện họ hàng. Tiêu chí của tôi là chọn nguyên liệu sạch, tươi ngon nhất từ sáng sớm tại chợ truyền thống, nêm nếm vừa miệng, không dùng bột ngọt dư thừa và chụp hóa đơn đầy đủ gửi quý khách.',
    verified: true,
    hygieneCertificate: true,
    sampleDishIds: ['dish_01', 'dish_02', 'dish_03', 'dish_04', 'dish_09']
  },
  {
    id: 'cook_02',
    name: 'Chú Hùng Chef',
    title: 'Chuyên gia tiệc gia đình & Hải sản',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    rating: 4.92,
    reviewCount: 98,
    experienceYears: 14,
    serviceAreas: ['Quận 7', 'Nhà Bè', 'Quận 4', 'Bình Chánh'],
    specialties: ['Hải sản tươi sống', 'Bò lúc lắc', 'Tiệc nướng BBQ tại nhà', 'Tiệc sinh nhật 10-50 khách'],
    supportedEvents: ['Tiệc sinh nhật', 'Họp mặt bạn bè', 'Tiệc tân gia', 'Đại tiệc gia đình (đến 60 người)'],
    maxGuests: 60,
    baseLaborFee: 250000,
    bio: 'Từng là bếp phó nhà hàng ẩm thực Việt 8 năm trước khi chuyển sang nấu tiệc tại gia tự do. Đội ngũ có thể mang theo bếp nướng, nồi niêu chuyên dụng và phụ bếp nếu tiệc lớn. Minh bạch toàn bộ phiếu cân và giá chợ.',
    verified: true,
    hygieneCertificate: true,
    sampleDishIds: ['dish_05', 'dish_06', 'dish_07', 'dish_10']
  },
  {
    id: 'cook_03',
    name: 'Chị Mai Lan',
    title: 'Bếp trưởng món Bắc & Thực đơn Eat Clean',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    rating: 4.88,
    reviewCount: 76,
    experienceYears: 9,
    serviceAreas: ['Quận 3', 'Tân Bình', 'Gò Vấp', 'Quận 10'],
    specialties: ['Món Bắc thanh cảnh', 'Canh cua cà pháo', 'Món chay cao cấp', 'Thực đơn giảm đường muối'],
    supportedEvents: ['Bữa ăn dinh dưỡng hàng ngày', 'Cơm gia đình', 'Bữa chay rằm & mùng một'],
    maxGuests: 12,
    baseLaborFee: 200000,
    bio: 'Tốt nghiệp trường Trung cấp Nghề Nấu ăn và chứng chỉ dinh dưỡng. Thấu hiểu nhu cầu ăn uống lành mạnh của các gia đình trẻ và người lớn tuổi cần kiêng khem mặn, dầu mỡ.',
    verified: true,
    hygieneCertificate: true,
    sampleDishIds: ['dish_03', 'dish_05', 'dish_08', 'dish_09']
  },
  {
    id: 'cook_04',
    name: 'Anh Tuấn Kiệt',
    title: 'Chuyên gia cỗ tiệc truyền thống & Đám giỗ',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    rating: 4.95,
    reviewCount: 115,
    experienceYears: 12,
    serviceAreas: ['TP. Thủ Đức', 'Quận 9', 'Dĩ An', 'Bình Thạnh'],
    specialties: ['Cỗ giỗ chạp 5-10 mâm', 'Heo quay bánh hỏi', 'Gà luộc cánh tiên', 'Lẩu cù lao truyền thống'],
    supportedEvents: ['Đám giỗ họ', 'Tiệc tân gia', 'Mâm cúng đầy tháng thôi nôi', 'Tiệc trên 40 khách'],
    maxGuests: 80,
    baseLaborFee: 300000,
    bio: 'Chuyên đảm nhận các mâm cỗ truyền thống trang trọng. Tinh thần cẩn thận, đúng giờ tuyệt đối, hỗ trợ chuẩn bị chén đĩa và bài trí mâm cỗ đẹp mắt dâng gia tiên.',
    verified: true,
    hygieneCertificate: true,
    sampleDishIds: ['dish_01', 'dish_05', 'dish_06', 'dish_10']
  }
];

export const MOCK_ORDERS: Order[] = [
  // Scenario A: Bữa cơm gia đình 4 người - Hoàn thành, có hóa đơn chứng từ, tách bạch tiền công, sẵn sàng thanh toán
  {
    id: 'ord_01',
    orderCode: 'HM-8291',
    customerId: 'user_cust_01',
    customerName: 'Nguyễn Thuỳ Chi',
    customerPhone: '0908 123 456',
    customerAddress: 'Toà Landmark 3, Vinhomes Central Park, P. 22, Q. Bình Thạnh',
    date: '2026-10-13',
    servingTime: '18:30',
    guestCount: 4,
    mealOccasion: 'Bữa cơm gia đình thường ngày',
    serviceType: 'cook_at_home',
    allergies: ['Không ăn cay nhiều'],
    generalPreferences: 'Bớt mặn, cơm dẻo vừa, ưu tiên rau xanh tươi non',
    items: [
      { dish: MOCK_DISHES[0], quantity: 1 }, // Thịt kho tàu
      { dish: MOCK_DISHES[1], quantity: 1 }, // Canh chua cá bớp
      { dish: MOCK_DISHES[2], quantity: 1 }, // Rau muống xào tỏi
    ],
    estimatedGroceryBudget: 400000,
    actualGroceryTotal: 368000,
    shoppingList: [
      {
        id: 'shop_01',
        name: 'Thịt ba rọi heo VietGAP (650g)',
        quantity: '650',
        unit: 'gram',
        estimatedPrice: 85000,
        actualPrice: 92000,
        subtotal: 92000,
        storeName: 'Co.opmart Văn Thánh',
        purchaseTime: '2026-10-13 14:15',
        receiptImageUrl: 'https://images.unsplash.com/photo-1554415707-9e44667ff221?auto=format&fit=crop&w=500&q=80',
        notes: 'Mua miếng thịt rọi rút sườn tươi mới về trong ngày, có tem kiểm dịch',
        status: 'purchased',
        approvedByCustomer: true,
      },
      {
        id: 'shop_02',
        name: 'Cá bớp biển cắt khoanh (420g)',
        quantity: '420',
        unit: 'gram',
        estimatedPrice: 75000,
        actualPrice: 82000,
        subtotal: 82000,
        storeName: 'Sạp cá tươi Chợ Thị Nghè',
        purchaseTime: '2026-10-13 14:35',
        receiptImageUrl: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=500&q=80',
        ingredientImageUrl: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=500&q=80',
        notes: 'Cá biển tươi mang đỏ au, thịt chắc nịch',
        status: 'purchased',
        approvedByCustomer: true,
      },
      {
        id: 'shop_03',
        name: 'Trứng cút sạch + Dừa xiêm tươi',
        quantity: '1',
        unit: 'phần',
        estimatedPrice: 38000,
        actualPrice: 36000,
        subtotal: 36000,
        storeName: 'Co.opmart Văn Thánh',
        purchaseTime: '2026-10-13 14:20',
        receiptImageUrl: 'https://images.unsplash.com/photo-1554415707-9e44667ff221?auto=format&fit=crop&w=500&q=80',
        status: 'purchased',
        approvedByCustomer: true,
      },
      {
        id: 'shop_04',
        name: 'Rau muống non + Bông điên điển + Đậu bắp + Bắp chuối',
        quantity: '1',
        unit: 'gói tổng hợp',
        estimatedPrice: 55000,
        actualPrice: 48000,
        subtotal: 48000,
        storeName: 'Chợ Thị Nghè',
        purchaseTime: '2026-10-13 14:45',
        ingredientImageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=500&q=80',
        notes: 'Rau tươi hái sáng, rửa sạch khử khuẩn',
        status: 'purchased',
        approvedByCustomer: true,
      },
      {
        id: 'shop_05',
        name: 'Gia vị thơm, ngò gai, ớt, me chín, tỏi cô đơn',
        quantity: '1',
        unit: 'phần',
        estimatedPrice: 25000,
        actualPrice: 20000,
        subtotal: 20000,
        storeName: 'Chợ Thị Nghè',
        purchaseTime: '2026-10-13 14:50',
        status: 'purchased',
        approvedByCustomer: true,
      },
      {
        id: 'shop_06',
        name: 'Gạo ST25 Ông Cua dẻo thơm (nấu tại nhà)',
        quantity: '1',
        unit: 'phần chuẩn bị',
        estimatedPrice: 25000,
        actualPrice: 20000,
        subtotal: 20000,
        storeName: 'Cửa hàng Gạo Sạch',
        purchaseTime: '2026-10-13 14:55',
        status: 'purchased',
        approvedByCustomer: true,
      }
    ],
    budgetChangeRequests: [],
    cookId: 'cook_01',
    cook: MOCK_COOKS[0],
    baseLaborFee: 180000,
    complexityAdjustment: 30000, // 2 món moderate (thịt kho, canh chua)
    guestCountAdjustment: 30000, // 4 khách
    deliveryFee: 0, // Đầu bếp đến tận nhà nấu - Miễn phí di chuyển & không có phí ship
    additionalServiceFee: 0,
    totalLaborFee: 240000,
    finalPayableAmount: 608000, // 368.000đ (thực chi đi chợ) + 240.000đ (tiền công tại nhà)
    status: 'service_completed', // Khách đang xem hóa đơn và xác nhận thanh toán
    statusHistory: [
      { status: 'confirmed', timestamp: '2026-10-13 09:00', note: 'Cô Bích Huệ đã nhận đơn' },
      { status: 'shopping_in_progress', timestamp: '2026-10-13 14:00', note: 'Đầu bếp bắt đầu đi chợ Thị Nghè & Co.opmart' },
      { status: 'evidence_submitted', timestamp: '2026-10-13 15:15', note: 'Đã tải lên toàn bộ hóa đơn đi chợ (368.000đ)' },
      { status: 'preparing_meal', timestamp: '2026-10-13 16:30', note: 'Đầu bếp đã có mặt tại nhà khách và nấu nướng trực tiếp tại gian bếp' },
      { status: 'service_completed', timestamp: '2026-10-13 18:25', note: 'Đã nấu xong, dọn mâm cơm lên bàn ăn nóng hổi và dọn dẹp sạch sẽ gian bếp' },
    ],
    createdAt: '2026-10-13 08:30',
  },

  // Scenario B: Tiệc sinh nhật 25 người tại nhà - Có báo giá chi tiết, chờ khách phê duyệt
  {
    id: 'ord_02',
    orderCode: 'HM-9104',
    customerId: 'user_cust_01',
    customerName: 'Nguyễn Thuỳ Chi',
    customerPhone: '0908 123 456',
    customerAddress: 'Biệt thự Palm Residence, Phường An Phú, TP. Thủ Đức',
    date: '2026-10-18',
    servingTime: '17:30',
    guestCount: 25,
    mealOccasion: 'Tiệc sinh nhật gia đình & bạn bè',
    serviceType: 'party_at_home',
    allergies: ['1 khách dị ứng đậu phộng nặng', 'Có trẻ nhỏ dưới 6 tuổi'],
    generalPreferences: 'Thực đơn 6 món tiệc thịnh soạn, có nướng BBQ sân vườn và tráng miệng chè bưởi',
    items: [
      { dish: MOCK_DISHES[9], quantity: 3 }, // Heo quay bánh hỏi
      { dish: MOCK_DISHES[5], quantity: 4 }, // Tôm càng xanh hấp nước dừa
      { dish: MOCK_DISHES[6], quantity: 4 }, // Bò Úc lúc lắc
      { dish: MOCK_DISHES[4], quantity: 3 }, // Gà ta hấp lá chanh
      { dish: MOCK_DISHES[8], quantity: 5 }, // Chè bưởi An Giang
    ],
    estimatedGroceryBudget: 4200000,
    actualGroceryTotal: 0,
    shoppingList: [],
    budgetChangeRequests: [],
    cookId: 'cook_02',
    cook: MOCK_COOKS[1],
    baseLaborFee: 650000,
    complexityAdjustment: 350000,
    guestCountAdjustment: 400000,
    deliveryFee: 0,
    additionalServiceFee: 700000, // 2 phụ bếp hỗ trợ phục vụ tiệc
    totalLaborFee: 2100000,
    quotation: {
      id: 'quote_01',
      cookId: 'cook_02',
      cookName: 'Chú Hùng Chef',
      orderId: 'ord_02',
      laborFee: 1400000,
      assistantCount: 2,
      assistantFee: 500000,
      equipmentFee: 200000, // Bếp nướng BBQ than không khói & vỉ nướng chuyên dụng
      estimatedPrepTimeHours: 6.5,
      proposedSubstitutions: 'Tôm càng xanh sẽ chọn loại sống đang bơi tại vựa hải sản chợ Đầm Sen; thịt heo quay lấy tại lò quen nổ giòn hạt lựu.',
      surchargeNotes: 'Bao gồm 2 nhân sự phụ bếp phụ trách nướng trực tiếp tại bàn tiệc và dọn dẹp sạch bóng gian bếp sau tiệc.',
      totalLaborAndServices: 2100000,
      status: 'pending',
      submittedAt: '2026-10-13 09:30',
    },
    finalPayableAmount: 2100000, // Tạm tính tiền dịch vụ, tiền chợ sẽ tính theo thực chi sau khi đi chợ
    status: 'quotation_submitted', // Chờ khách duyệt báo giá
    statusHistory: [
      { status: 'awaiting_quotation', timestamp: '2026-10-13 08:45', note: 'Khách gửi yêu cầu tiệc 25 người' },
      { status: 'quotation_submitted', timestamp: '2026-10-13 09:30', note: 'Chú Hùng Chef đã gửi bảng báo giá chi tiết (2.100.000đ tiền công & 2 phụ bếp)' },
    ],
    createdAt: '2026-10-13 08:45',
  },

  // Scenario C: Đơn hàng đang đi chợ gặp giá nguyên liệu tăng - Chờ duyệt thay đổi ngân sách
  {
    id: 'ord_03',
    orderCode: 'HM-7742',
    customerId: 'user_cust_01',
    customerName: 'Nguyễn Thuỳ Chi',
    customerPhone: '0908 123 456',
    customerAddress: 'Toà Landmark 3, Vinhomes Central Park, Q. Bình Thạnh',
    date: '2026-10-14',
    servingTime: '12:00',
    guestCount: 6,
    mealOccasion: 'Bữa trưa tiếp khách cuối tuần',
    serviceType: 'cook_at_home',
    allergies: ['Không'],
    generalPreferences: 'Đầu bếp đến trước 10:30 để kịp nấu nướng hoàn tất trước 12:00',
    items: [
      { dish: MOCK_DISHES[5], quantity: 2 }, // Tôm càng xanh
      { dish: MOCK_DISHES[4], quantity: 1 }, // Gà hấp lá chanh
      { dish: MOCK_DISHES[2], quantity: 2 }, // Rau muống xào
    ],
    estimatedGroceryBudget: 750000,
    actualGroceryTotal: 560000,
    shoppingList: [
      {
        id: 'shop_31',
        name: 'Gà ta thả vườn (1.5kg)',
        quantity: '1.5',
        unit: 'kg',
        estimatedPrice: 165000,
        actualPrice: 170000,
        subtotal: 170000,
        storeName: 'Chợ Bà Chiểu',
        purchaseTime: '2026-10-13 07:30',
        receiptImageUrl: 'https://images.unsplash.com/photo-1554415707-9e44667ff221?auto=format&fit=crop&w=500&q=80',
        status: 'purchased',
        approvedByCustomer: true,
      },
      {
        id: 'shop_32',
        name: 'Rau muống + gia vị lá chanh gừng',
        quantity: '1',
        unit: 'phần',
        estimatedPrice: 50000,
        actualPrice: 45000,
        subtotal: 45000,
        storeName: 'Chợ Bà Chiểu',
        purchaseTime: '2026-10-13 07:45',
        status: 'purchased',
        approvedByCustomer: true,
      },
      {
        id: 'shop_33',
        name: 'Tôm càng xanh sống loại 1 (1.2kg)',
        quantity: '1.2',
        unit: 'kg',
        estimatedPrice: 380000,
        actualPrice: 460000,
        subtotal: 460000,
        storeName: 'Vựa hải sản Tươi Sống Bà Chiểu',
        purchaseTime: '2026-10-13 08:00',
        receiptImageUrl: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=500&q=80',
        ingredientImageUrl: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=500&q=80',
        notes: 'Hôm nay rằm nước kém, tôm càng loại to giá tăng 80.000đ so với dự tính. Đã chụp ảnh bảng giá sạp chợ.',
        status: 'price_increased',
        approvedByCustomer: false,
      }
    ],
    budgetChangeRequests: [
      {
        id: 'bcr_01',
        originalBudget: 750000,
        requestedBudget: 830000,
        difference: 80000,
        reason: 'Hôm nay nước kém nên nguồn tôm càng xanh sống loại 1 khan hiếm, giá tại vựa tăng từ 380k lên 460k/kg (+80.000đ). Nếu khách muốn giữ ngân sách cũ, tôi có thể đổi sang Tôm sú loại to (370.000đ) thịt cũng rất chắc ngọt.',
        affectedItem: 'Tôm càng xanh sống loại 1',
        evidencePhotoUrl: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=500&q=80',
        status: 'pending',
        requestedAt: '2026-10-13 08:05',
      }
    ],
    cookId: 'cook_01',
    cook: MOCK_COOKS[0],
    baseLaborFee: 200000,
    complexityAdjustment: 50000,
    guestCountAdjustment: 40000,
    deliveryFee: 0, // Đầu bếp đến tận nhà nấu - Miễn phí di chuyển
    additionalServiceFee: 0,
    totalLaborFee: 330000,
    finalPayableAmount: 1040000,
    status: 'awaiting_budget_approval', // Tạm dừng đi chợ chờ khách duyệt
    statusHistory: [
      { status: 'confirmed', timestamp: '2026-10-12 20:00', note: 'Đơn đã xác nhận' },
      { status: 'shopping_in_progress', timestamp: '2026-10-13 07:15', note: 'Đầu bếp bắt đầu đi chợ Bà Chiểu' },
      { status: 'awaiting_budget_approval', timestamp: '2026-10-13 08:05', note: 'Đầu bếp gửi yêu cầu điều chỉnh ngân sách tôm càng xanh (+80.000đ)' },
    ],
    createdAt: '2026-10-12 19:30',
  },

  // Scenario D: Đơn hàng khiếu nại chứng từ (Disputed)
  {
    id: 'ord_04',
    orderCode: 'HM-6420',
    customerId: 'user_cust_01',
    customerName: 'Nguyễn Thuỳ Chi',
    customerPhone: '0908 123 456',
    customerAddress: 'Toà Aqua 2, Vinhomes Golden River, Quận 1',
    date: '2026-10-11',
    servingTime: '19:00',
    guestCount: 5,
    mealOccasion: 'Cơm tối gia đình',
    serviceType: 'cook_at_home',
    allergies: [],
    generalPreferences: 'Nấu trực tiếp tại gian bếp, nêm vừa khẩu vị miền Nam',
    items: [
      { dish: MOCK_DISHES[6], quantity: 2 }, // Bò lúc lắc
      { dish: MOCK_DISHES[2], quantity: 1 }, // Rau muống
    ],
    estimatedGroceryBudget: 450000,
    actualGroceryTotal: 580000,
    shoppingList: [
      {
        id: 'shop_41',
        name: 'Thịt bò thăn',
        quantity: '600',
        unit: 'gram',
        estimatedPrice: 180000,
        actualPrice: 320000,
        subtotal: 320000,
        storeName: 'Cửa hàng thịt nhập khẩu',
        purchaseTime: '2026-10-11 16:00',
        receiptImageUrl: 'https://images.unsplash.com/photo-1554415707-9e44667ff221?auto=format&fit=crop&w=500&q=80',
        notes: 'Hóa đơn in nhòe, không rõ tên loại thịt thăn hay wagyu',
        status: 'purchased',
      }
    ],
    budgetChangeRequests: [],
    cookId: 'cook_02',
    cook: MOCK_COOKS[1],
    baseLaborFee: 220000,
    complexityAdjustment: 30000,
    guestCountAdjustment: 30000,
    deliveryFee: 0,
    additionalServiceFee: 0,
    totalLaborFee: 280000,
    finalPayableAmount: 860000,
    status: 'disputed', // Đang tranh chấp hóa đơn, tiền chưa bị thu
    dispute: {
      id: 'disp_01',
      reason: 'Hóa đơn thịt bò 320.000đ bị mờ chữ và vượt ngân sách ban đầu mà không có tin nhắn xin phép trước.',
      description: 'Khách hàng đồng ý trả 200.000đ tiền bò theo định mức ban đầu, yêu cầu đầu bếp làm rõ khoản chênh lệch 120.000đ trước khi hoàn tất thanh toán.',
      reportedAmount: 120000,
      status: 'investigating',
      createdAt: '2026-10-11 20:30',
    },
    statusHistory: [
      { status: 'service_completed', timestamp: '2026-10-11 19:45', note: 'Đầu bếp hoàn tất nấu món và giao tận nơi' },
      { status: 'disputed', timestamp: '2026-10-11 20:30', note: 'Khách hàng gửi khiếu nại về chứng từ tiền thịt bò' },
    ],
    createdAt: '2026-10-11 14:00',
  }
];

export const SUGGESTED_MENUS = [
  {
    id: 'menu_fam_4',
    title: 'Mâm cơm gia đình Nam Bộ (3-4 người)',
    guestCount: '3-4 người',
    dishCount: 3,
    dishes: ['Thịt kho tàu nước dừa', 'Canh chua cá bớp', 'Rau muống xào tỏi'],
    dishIds: ['dish_01', 'dish_02', 'dish_03'],
    estimatedGrocery: '290.000đ - 350.000đ',
    estimatedLabor: '200.000đ - 250.000đ',
    complexity: 'moderate',
    description: 'Bữa cơm trọn vẹn vị quê nhà: có món mặn đậm đà, món canh chua ngọt thanh mát và đĩa rau xanh xào tỏi giòn thơm.',
  },
  {
    id: 'menu_weekend_6',
    title: 'Mâm cơm cuối tuần ấm cúng (5-8 người)',
    guestCount: '5-8 người',
    dishCount: 4,
    dishes: ['Gà ta hấp lá chanh', 'Cá lóc đồng kho tộ', 'Canh chua cá bớp', 'Rau muống xào tỏi'],
    dishIds: ['dish_05', 'dish_04', 'dish_02', 'dish_03'],
    estimatedGrocery: '450.000đ - 550.000đ',
    estimatedLabor: '320.000đ - 380.000đ',
    complexity: 'moderate',
    description: 'Thực đơn sum họp đại gia đình nhiều thế hệ với gà thả vườn giòn da, cá đồng kho tộ đậm vị mộc mạc.',
  },
  {
    id: 'menu_party_15',
    title: 'Tiệc sinh nhật & Họp mặt thân mật (10-15 người)',
    guestCount: '10-15 người',
    dishCount: 5,
    dishes: ['Tôm càng xanh hấp nước dừa', 'Bò Úc lúc lắc', 'Gà ta hấp lá chanh', 'Rau xào tổng hợp', 'Chè bưởi An Giang'],
    dishIds: ['dish_06', 'dish_07', 'dish_05', 'dish_03', 'dish_09'],
    estimatedGrocery: '1.200.000đ - 1.500.000đ',
    estimatedLabor: '600.000đ - 850.000đ',
    complexity: 'complex',
    description: 'Thực đơn nâng cao cho tiệc sinh nhật hoặc khao bạn bè tại nhà, món ăn chế biến tại chỗ nóng sốt.',
  },
  {
    id: 'menu_banquet_30',
    title: 'Đại tiệc gia đình / Giỗ cỗ thịnh soạn (20-30 người)',
    guestCount: '20-30 người',
    dishCount: 6,
    dishes: ['Heo sữa quay bánh hỏi', 'Tôm càng xanh hấp dừa', 'Gà ta lá chanh', 'Bò lúc lắc', 'Canh súp hải sản', 'Chè bưởi'],
    dishIds: ['dish_10', 'dish_06', 'dish_05', 'dish_07', 'dish_09'],
    estimatedGrocery: '3.000.000đ - 4.200.000đ',
    estimatedLabor: 'Yêu cầu báo giá riêng (từ 1.500.000đ)',
    complexity: 'complex',
    description: 'Hỗ trợ phụ bếp chuyên nghiệp, chuẩn bị dụng cụ bàn tiệc, báo giá minh bạch theo khối lượng công việc.',
  }
];

export const FAQS = [
  {
    q: 'Tại sao tiền chợ và tiền công nấu ăn lại tách biệt?',
    a: 'Tại HomeMeal, bạn không phải mua các gói thức ăn chế biến sẵn giá cố định đắt đỏ. Đầu bếp đi chợ theo đúng ngân sách bạn duyệt, chụp hóa đơn thực tế và bạn chỉ thanh toán đúng số tiền thực chi. Tiền công được tính riêng biệt dựa trên số lượng khách và độ phức tạp của món ăn.'
  },
  {
    q: 'Nếu đi chợ hết ít hơn ngân sách tôi đặt thì sao?',
    a: 'Bạn chỉ thanh toán đúng số tiền trên hóa đơn thực tế! Số tiền ngân sách còn thừa sẽ hoàn toàn không bị tính vào hóa đơn cuối cùng.'
  },
  {
    q: 'Nếu giá nguyên liệu tại chợ tăng đột xuất, đầu bếp xử lý thế nào?',
    a: 'Đầu bếp bắt buộc phải chụp ảnh bảng giá và gửi yêu cầu xin duyệt điều chỉnh ngân sách qua ứng dụng. Chỉ khi bạn bấm "Đồng ý" thì đầu bếp mới được mua. Bạn cũng có thể yêu cầu đầu bếp đổi sang nguyên liệu khác tương đương.'
  },
  {
    q: 'Khi nào tôi mới phải thanh toán tiền?',
    a: 'Bạn chỉ thanh toán SAU KHI bữa ăn đã được nấu xong (hoặc giao đến nhà) và bạn đã kiểm tra đầy đủ hóa đơn chứng từ. Bạn có quyền từ chối thanh toán các khoản tiền không có chứng từ hợp lệ.'
  },
  {
    q: 'Tiệc từ 20 đến 50 người có người phụ bếp không?',
    a: 'Có! Với các tiệc lớn, đầu bếp sẽ gửi báo giá chi tiết gồm số lượng phụ bếp và dụng cụ chuyên dụng (bếp nướng, nồi tiệc). Khách hàng duyệt báo giá trước khi đầu bếp tiến hành công việc.'
  }
];
