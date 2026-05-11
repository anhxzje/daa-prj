# Skyscrapers Solver

## Giới thiệu trò chơi Skyscrapers

Skyscrapers (Những tòa nhà chọc trời) là một trò chơi giải đố logic dựa trên lưới vuông có kích thước N×N. 
Mục tiêu của trò chơi là lấp đầy lưới bằng các số từ 1 đến N sao cho tuân thủ các quy tắc sau:

1. Mỗi hàng và mỗi cột chứa tập hợp các số từ 1 đến N (không có số nào lặp lại trên cùng một hàng hoặc cột).
2. Các số đại diện cho chiều cao của các tòa nhà.
3. Các manh mối (clue) nằm ở rìa ngoài của lưới cho biết số lượng tòa nhà có thể nhìn thấy được từ hướng đó, dọc theo hàng hoặc cột tương ứng. Một tòa nhà được coi là có thể nhìn thấy nếu tất cả các tòa nhà đứng trước nó đều thấp hơn nó.

## Cấu trúc dự án

- `/public/skyscrapers_dataset_1500.json`: Bộ dữ liệu chứa 1500 đề bài.
- `/src/lib/engine.ts`: Chứa logic thao tác dữ liệu, sinh đề từ bộ dữ liệu và logic thuật toán giải bài.
- `/src/lib/utils.ts`: Các hàm tiện ích dùng chung.
- `/src/App.tsx`: Giao diện chính của ứng dụng, kết nối dữ liệu từ dataset, điều khiển vòng đời ứng dụng, quản lý trạng thái bảng điều khiển, lịch sử giải và cài đặt Light/Dark theme.
- `/src/index.css`: Cấu hình giao diện tổng thể và khai báo biến CSS phục vụ hệ thống giao diện thay đổi theo theme.

## Các phương pháp giải

### 1. Branch and Bound (Nhánh cận)
Đây là một thuật toán duyệt dạng quay lui (backtracking). Thuật toán duyệt qua từng ô và thử điền các giá trị khả dĩ (từ 1 đến N). Tại mỗi bước, nếu giá trị điền vào vi phạm quy tắc hàng/cột hoặc quy tắc tầm nhìn của manh mối, thuật toán sẽ bỏ qua nhánh đó và thử giá trị khác, giúp giảm thiểu đáng kể số lượng cấu hình phải duyệt so với duyệt toàn bộ (brute-force).

### 2. Integer Linear Programming (ILP)
Phương pháp này chuyển đổi bảng và quy tắc chơi thành bài toán quy hoạch nguyên tuyến tính. Sử dụng các biến quyết định dạng nhị phân, quy tắc duy nhất trên hàng và cột cùng với quy tắc về tầm nhìn (clues) được mô hình hóa thành hệ các phương trình và bất phương trình ràng buộc. Các solver công nghiệp mạnh mẽ như Gurobi hoặc CPLEX sẽ được áp dụng để tìm ra phân bổ biến thỏa mãn mọi ràng buộc.

### 3. Google OR-Tools
Áp dụng nền tảng Constraint Programming (CP). Bảng lưới được mô tả bằng một tập các biến nguyên lấy giá trị từ 1 đến N. Ràng buộc `AllDifferent` đảm bảo tính duy nhất trên hàng và cột. Yêu cầu về tầm nhìn được mô phỏng bằng việc duy trì các biến trung gian ghi nhận chiều cao lớn nhất đạt được từ điểm nhìn, từ đó đếm số lần tòa nhà xuất hiện và giới hạn theo đúng giá trị của manh mối.

## Hướng dẫn chạy dự án

1. Cài đặt các gói phụ thuộc cần thiết:
   ```bash
   npm install
   ```

2. Khởi chạy ứng dụng trong môi trường phát triển:
   ```bash
   npm run dev
   ```

3. Mở trình duyệt web của bạn và truy cập vào đường dẫn:
   ```
   http://localhost:3000
   ```
