// Language can be "vi" or "en"

export const translations = {
  // ── Common ──────────────────────────────────────────────
  common: {
    loading: { vi: "Đang tải...", en: "Loading..." },
    save: { vi: "Lưu", en: "Save" },
    saveChanges: { vi: "Lưu thay đổi", en: "Save changes" },
    cancel: { vi: "Hủy", en: "Cancel" },
    delete: { vi: "Xóa", en: "Delete" },
    add: { vi: "Thêm", en: "Add" },
    edit: { vi: "Sửa", en: "Edit" },
    update: { vi: "Cập nhật", en: "Update" },
    close: { vi: "Đóng", en: "Close" },
    saving: { vi: "Đang lưu...", en: "Saving..." },
    processing: { vi: "Đang xử lý...", en: "Processing..." },
    home: { vi: "Trang chủ", en: "Home" },
    explore: { vi: "Khám phá", en: "Explore" },
    copyright: {
      vi: "© 2026 Website Nghiên Cứu Khoa Học. Được xây dựng để chia sẻ kiến thức.",
      en: "© 2026 Scientific Research Websites. Built to share knowledge.",
    },
    all: { vi: "Tất cả", en: "All" },
  },

  // ── Admin ───────────────────────────────────────────────
  admin: {
    login: { vi: "Đăng nhập quản trị", en: "Admin Login" },
    logout: { vi: "Đăng xuất", en: "Logout" },
    loginTitle: { vi: "Đăng nhập quản trị", en: "Admin Login" },
    loginDesc: {
      vi: "Nhập mật khẩu để truy cập chế độ quản trị website",
      en: "Enter password to access admin mode",
    },
    password: { vi: "Mật khẩu", en: "Password" },
    passwordPlaceholder: { vi: "Nhập mật khẩu quản trị", en: "Enter admin password" },
    loginButton: { vi: "Đăng nhập", en: "Log in" },
    loginOnly: { vi: "Chỉ dành cho quản trị viên website", en: "For website administrators only" },
    loginSuccess: { vi: "Đăng nhập quản trị thành công!", en: "Admin login successful!" },
    loginFailed: { vi: "Mật khẩu không đúng!", en: "Incorrect password!" },
    logoutSuccess: { vi: "Đã đăng xuất khỏi chế độ quản trị", en: "Logged out of admin mode" },
    authenticating: { vi: "Đang xác thực...", en: "Authenticating..." },
    serverError: { vi: "Không thể kết nối server. Vui lòng thử lại.", en: "Cannot connect to server. Please try again." },
    enterPassword: { vi: "Vui lòng nhập mật khẩu", en: "Please enter password" },

    // Change password
    changePassword: { vi: "Đổi mật khẩu", en: "Change Password" },
    changePasswordTitle: { vi: "Đổi mật khẩu quản trị", en: "Change Admin Password" },
    changePasswordDesc: {
      vi: "Nhập mật khẩu hiện tại và mật khẩu mới để thay đổi",
      en: "Enter current and new password to change",
    },
    currentPassword: { vi: "Mật khẩu hiện tại", en: "Current password" },
    currentPasswordPlaceholder: { vi: "Nhập mật khẩu hiện tại", en: "Enter current password" },
    newPassword: { vi: "Mật khẩu mới", en: "New password" },
    newPasswordPlaceholder: { vi: "Nhập mật khẩu mới (tối thiểu 4 ký tự)", en: "Enter new password (min 4 chars)" },
    confirmPassword: { vi: "Xác nhận mật khẩu mới", en: "Confirm new password" },
    confirmPasswordPlaceholder: { vi: "Nhập lại mật khẩu mới", en: "Re-enter new password" },
    passwordMinLength: { vi: "Mật khẩu phải có ít nhất 4 ký tự", en: "Password must be at least 4 characters" },
    passwordMismatch: { vi: "Mật khẩu xác nhận không khớp", en: "Passwords do not match" },
    passwordSame: { vi: "Mật khẩu mới phải khác mật khẩu hiện tại", en: "New password must differ from current" },
    passwordChanged: { vi: "Đổi mật khẩu thành công!", en: "Password changed successfully!" },
    enterCurrentPassword: { vi: "Vui lòng nhập mật khẩu hiện tại", en: "Please enter current password" },
    enterNewPassword: { vi: "Vui lòng nhập mật khẩu mới", en: "Please enter new password" },

    // Admin mode
    adminMode: { vi: "Chế độ quản trị", en: "Admin mode" },
    editContent: { vi: "Chỉnh sửa nội dung", en: "Edit content" },
    loginToEdit: {
      vi: "Đăng nhập để chỉnh sửa nội dung trang",
      en: "Log in to edit page content",
    },
    loginToAccess: {
      vi: "Đăng nhập để truy cập chế độ quản trị",
      en: "Log in to access admin mode",
    },
  },

  // ── About Page ──────────────────────────────────────────
  about: {
    editHero: { vi: "Sửa hero", en: "Edit hero" },
    editHeroTitle: { vi: "Chỉnh sửa phần Hero", en: "Edit Hero Section" },
    editHeroDesc: { vi: "Cập nhật thông tin giới thiệu chính", en: "Update main introduction info" },
    nameLabel: { vi: "Tên / Lời chào", en: "Name / Greeting" },
    titleLabel: { vi: "Chức danh", en: "Title" },
    subtitleLabel: { vi: "Phụ đề", en: "Subtitle" },
    avatarUrlLabel: { vi: "URL ảnh đại diện", en: "Avatar URL" },
    bioLabel: { vi: "Giới thiệu ngắn", en: "Short bio" },
    nameRequired: { vi: "Tên không được để trống", en: "Name cannot be empty" },
    heroUpdated: { vi: "Đã cập nhật thông tin hero", en: "Hero info updated" },

    editStats: { vi: "Sửa thống kê", en: "Edit stats" },
    editStatsTitle: { vi: "Chỉnh sửa thống kê", en: "Edit Statistics" },
    editStatsDesc: { vi: "Cập nhật các con số nổi bật", en: "Update highlight numbers" },
    statValuePlaceholder: { vi: "Giá trị (vd: 24+)", en: "Value (e.g. 24+)" },
    statLabelPlaceholder: { vi: "Nhãn (vd: Website)", en: "Label (e.g. Websites)" },
    addItem: { vi: "Thêm mục", en: "Add item" },
    statsUpdated: { vi: "Đã cập nhật thống kê", en: "Statistics updated" },

    // Sections
    editSection: { vi: "Chỉnh sửa phần", en: "Edit section" },
    addSection: { vi: "Thêm phần mới", en: "Add new section" },
    addSectionDesc: {
      vi: "Thêm một phần nội dung mới vào trang giới thiệu",
      en: "Add a new content section to the about page",
    },
    updateSectionDesc: { vi: "Cập nhật nội dung phần này", en: "Update this section's content" },
    sectionTitle: { vi: "Tiêu đề", en: "Title" },
    sectionTitlePlaceholder: { vi: "Nhập tiêu đề...", en: "Enter title..." },
    sectionContent: { vi: "Nội dung", en: "Content" },
    sectionContentPlaceholder: { vi: "Nhập nội dung...", en: "Enter content..." },
    displayType: { vi: "Kiểu hiển thị", en: "Display type" },
    typeText: { vi: "Văn bản", en: "Text" },
    typeHighlight: { vi: "Nổi bật", en: "Highlight" },
    typeQuote: { vi: "Trích dẫn", en: "Quote" },
    icon: { vi: "Icon", en: "Icon" },
    fillRequired: { vi: "Vui lòng điền đầy đủ thông tin", en: "Please fill in all fields" },
    sectionAdded: { vi: "Đã thêm phần mới", en: "New section added" },
    sectionUpdated: { vi: "Đã cập nhật", en: "Updated" },
    sectionDeleted: { vi: "Đã xóa phần", en: "Section deleted" },
    deleteSection: { vi: "Xóa phần này?", en: "Delete this section?" },
    deleteSectionDesc: {
      vi: (title) => `Bạn có chắc muốn xóa phần "${title}"? Hành động này không thể hoàn tác.`,
      en: (title) => `Are you sure you want to delete "${title}"? This cannot be undone.`,
    },
    addNewSection: { vi: "Thêm phần nội dung mới", en: "Add new content section" },
    saveError: { vi: "Không thể lưu lên server", en: "Cannot save to server" },

    // Navigation cards
    websiteList: { vi: "Danh sách Website", en: "Website List" },
    websiteListDesc: { vi: "Khám phá các công cụ nghiên cứu", en: "Explore research tools" },
    changelogTitle: { vi: "Nhật ký cập nhật", en: "Update Log" },
    changelogDesc: { vi: "Xem lịch sử và lộ trình phát triển", en: "View history and roadmap" },
  },

  // ── Home Page ───────────────────────────────────────────
  home: {
    title: { vi: "Website Nghiên Cứu Khoa Học", en: "Scientific Research Websites" },
    subtitle: {
      vi: "Tổng hợp các công cụ và nguồn tài nguyên hữu ích cho nhà nghiên cứu",
      en: "A collection of useful tools and resources for researchers",
    },
    changelog: { vi: "Nhật ký", en: "Changelog" },
    addWebsite: { vi: "Thêm Website", en: "Add Website" },
    manageCategories: { vi: "Quản lý lĩnh vực", en: "Manage Categories" },
    dragToReorder: { vi: "Sắp xếp bằng kéo thả", en: "Drag to reorder" },
    dragHint: { vi: "Kéo thả để sắp xếp", en: "Drag to reorder" },
    dragFilterHint: { vi: "Bỏ bộ lọc để sử dụng kéo thả", en: "Remove filters to use drag & drop" },
    dragFilterInfo: { vi: "Kéo thả chỉ hoạt động khi không có bộ lọc", en: "Drag & drop only works without filters" },
    saveOrder: { vi: "Lưu thứ tự", en: "Save order" },
    savingOrder: { vi: "Đang lưu...", en: "Saving..." },
    orderSaved: { vi: "Đã lưu thứ tự website!", en: "Website order saved!" },
    orderSaveError: { vi: "Không thể lưu thứ tự", en: "Cannot save order" },
    found: { vi: "Tìm thấy", en: "Found" },
    website: { vi: "website", en: "website(s)" },
    noResults: { vi: "Không tìm thấy website nào phù hợp", en: "No matching websites found" },
    noResultsHint: {
      vi: "Thử tìm kiếm với từ khóa khác hoặc chọn lĩnh vực khác",
      en: "Try different keywords or select another category",
    },
    usingLocalData: { vi: "Đang sử dụng dữ liệu local - server chưa sẵn sàng", en: "Using local data - server not ready" },
    initSuccess: { vi: "Đã khởi tạo dữ liệu mẫu", en: "Sample data initialized" },
    initError: { vi: "Không thể khởi tạo dữ liệu", en: "Cannot initialize data" },
    addError: { vi: "Không thể thêm website", en: "Cannot add website" },
    updateError: { vi: "Không thể cập nhật website", en: "Cannot update website" },
    deleteError: { vi: "Không thể xóa website", en: "Cannot delete website" },
  },

  // ── Search Bar ──────────────────────────────────────────
  search: {
    placeholder: { vi: "Tìm kiếm theo tên, mô tả, tags...", en: "Search by name, description, tags..." },
    selectCategory: { vi: "Chọn lĩnh vực", en: "Select category" },
  },

  // ── Sort ─────────────────────────────────────────────────
  sort: {
    label: { vi: "Sắp xếp", en: "Sort" },
    default: { vi: "Mặc định", en: "Default" },
    nameAZ: { vi: "Tên A → Z", en: "Name A → Z" },
    nameZA: { vi: "Tên Z → A", en: "Name Z → A" },
    newest: { vi: "Mới nhất", en: "Newest first" },
    oldest: { vi: "Cũ nhất", en: "Oldest first" },
    recentlyUpdated: { vi: "Cập nhật gần đây", en: "Recently updated" },
  },

  // ── View Mode ───────────────────────────────────────────
  viewMode: {
    grid: { vi: "Lưới", en: "Grid" },
    list: { vi: "Danh sách", en: "List" },
    cards: { vi: "Thẻ", en: "Cards" },
  },

  // ── Add/Edit Website ────────────────────────────────────
  websiteForm: {
    addTitle: { vi: "Thêm Website Mới", en: "Add New Website" },
    addDesc: {
      vi: "Thêm một website nghiên cứu/khoa học vào danh sách",
      en: "Add a research/science website to the list",
    },
    editTitle: { vi: "Chỉnh sửa Website", en: "Edit Website" },
    editDesc: { vi: "Cập nhật thông tin website", en: "Update website information" },
    name: { vi: "Tên Website", en: "Website Name" },
    namePlaceholder: { vi: "VD: Google Scholar", en: "e.g. Google Scholar" },
    url: { vi: "URL", en: "URL" },
    description: { vi: "Mô tả", en: "Description" },
    descPlaceholder: { vi: "Mô tả chi tiết về website...", en: "Detailed website description..." },
    category: { vi: "Lĩnh vực", en: "Category" },
    tags: { vi: "Thẻ (Tags)", en: "Tags" },
    tagsPlaceholder: { vi: "Nhập các thẻ, phân cách bằng dấu phẩy", en: "Enter tags, separated by commas" },
    tagsHint: { vi: "VD: miễn phí, tìm kiếm, AI", en: "e.g. free, search, AI" },
    iconLabel: { vi: "Icon (Emoji)", en: "Icon (Emoji)" },
    addButton: { vi: "Thêm Website", en: "Add Website" },
    updateButton: { vi: "Cập nhật", en: "Update" },
    addSuccess: { vi: "Đã thêm website thành công!", en: "Website added successfully!" },
    updateSuccess: { vi: "Đã cập nhật website!", en: "Website updated!" },
    deleteSuccess: { vi: "Đã xóa website!", en: "Website deleted!" },
    fillRequired: { vi: "Vui lòng điền đầy đủ thông tin bắt buộc", en: "Please fill in all required fields" },
    invalidUrl: { vi: "URL không hợp lệ", en: "Invalid URL" },
    confirmDelete: { vi: "Xác nhận xóa", en: "Confirm delete" },
    confirmDeleteDesc: {
      vi: (name) => `Bạn có chắc chắn muốn xóa website "${name}"? Hành động này không thể hoàn tác.`,
      en: (name) => `Are you sure you want to delete "${name}"? This cannot be undone.`,
    },
  },

  // ── Website Actions ─────────────────────────────────────
  actions: {
    rate: { vi: "Đánh giá", en: "Rate" },
    rateTitle: { vi: (name) => `Đánh giá ${name}`, en: (name) => `Rate ${name}` },
    rateDesc: {
      vi: "Chia sẻ trải nghiệm của bạn với cộng đồng",
      en: "Share your experience with the community",
    },
    commentPlaceholder: { vi: "Nhận xét của bạn (không bắt buộc)", en: "Your comment (optional)" },
    submitRating: { vi: "Gửi đánh giá", en: "Submit rating" },
    selectStars: { vi: "Vui lòng chọn số sao", en: "Please select stars" },
    ratingSuccess: { vi: "Đã gửi đánh giá!", en: "Rating submitted!" },
    saved: { vi: "Đã lưu", en: "Saved" },
    favorite: { vi: "Yêu thích", en: "Favorite" },
    copied: { vi: "Đã sao chép", en: "Copied" },
    copyLink: { vi: "Sao chép link", en: "Copy link" },
    linkCopied: { vi: "Đã sao chép link!", en: "Link copied!" },
    linkCopyError: { vi: "Không thể sao chép link", en: "Cannot copy link" },

    // Ad dialog
    adWaitTitle: { vi: "Vui lòng chờ để sao chép link", en: "Please wait to copy link" },
    adWaitDesc: {
      vi: "Link sẽ được tự động sao chép sau khi hết thời gian chờ",
      en: "Link will be automatically copied after countdown",
    },
    adLabel: { vi: "Quảng cáo / Advertisement", en: "Advertisement" },
    adThanks: {
      vi: "Cảm ơn bạn đã chờ đợi! Link sẽ được copy tự động.",
      en: "Thanks for waiting! Link will be copied automatically.",
    },
    adCancel: { vi: "Hủy bỏ", en: "Cancel" },
  },

  // ── Category Manager ────────────────────────────────────
  categories: {
    manage: { vi: "Quản lý lĩnh vực", en: "Manage Categories" },
    manageDesc: {
      vi: "Thêm, sửa hoặc xóa các lĩnh vực phân loại website",
      en: "Add, edit, or delete website categories",
    },
    newPlaceholder: { vi: "Nhập tên lĩnh vực mới...", en: "Enter new category name..." },
    emptyName: { vi: "Tên lĩnh vực không được để trống", en: "Category name cannot be empty" },
    exists: { vi: "Lĩnh vực này đã tồn tại", en: "This category already exists" },
    added: { vi: (name) => `Đã thêm lĩnh vực "${name}"`, en: (name) => `Category "${name}" added` },
    renamed: { vi: (name) => `Đã đổi tên thành "${name}"`, en: (name) => `Renamed to "${name}"` },
    deleted: { vi: (name) => `Đã xóa lĩnh vực "${name}"`, en: (name) => `Category "${name}" deleted` },
    deleteTitle: { vi: "Xóa lĩnh vực", en: "Delete Category" },
    deleteDesc: { vi: (name) => `Bạn có chắc muốn xóa lĩnh vực "${name}"?`, en: (name) => `Are you sure you want to delete "${name}"?` },
    deleteWarning: {
      vi: (count) => `⚠️ Hiện có ${count} website trong lĩnh vực này. Các website đó sẽ được chuyển sang lĩnh vực "Khác".`,
      en: (count) => `⚠️ There are ${count} website(s) in this category. They will be moved to "Other".`,
    },
    empty: { vi: "Chưa có lĩnh vực nào", en: "No categories yet" },
    total: { vi: (count) => `Tổng: ${count} lĩnh vực`, en: (count) => `Total: ${count} categories` },
  },

  // ── Changelog ───────────────────────────────────────────
  changelog: {
    title: { vi: "Nhật ký cập nhật & Lộ trình", en: "Changelog & Roadmap" },
    backToHome: { vi: "Quay lại trang chủ", en: "Back to home" },
    backToWebsites: { vi: "Danh sách Website", en: "Website List" },
    done: { vi: "Hoàn thành", en: "Completed" },
    inProgress: { vi: "Đang phát triển", en: "In progress" },
    planned: { vi: "Dự kiến", en: "Planned" },
    feature: { vi: "Tính năng mới", en: "New feature" },
    fix: { vi: "Sửa lỗi", en: "Bug fix" },
    improvement: { vi: "Cải tiến", en: "Improvement" },
    noItems: { vi: "Không có mục nào trong danh mục này.", en: "No items in this category." },
    comingSoon: { vi: "Sắp tới", en: "Coming soon" },
    summary: {
      vi: (done, prog, plan) =>
        `${done} hoàn thành${prog > 0 ? ` · ${prog} đang phát triển` : ""} · ${plan} dự kiến`,
      en: (done, prog, plan) =>
        `${done} completed${prog > 0 ? ` · ${prog} in progress` : ""} · ${plan} planned`,
    },
  },

  // ── Social Links ────────────────────────────────────────
  social: {
    title: { vi: "Liên hệ", en: "Contact" },
    subtitle: {
      vi: "Kết nối với tôi qua các nền tảng trên để được hỗ trợ và cập nhật thông tin mới nhất",
      en: "Connect with me through the platforms above for support and latest updates",
    },
  },
};