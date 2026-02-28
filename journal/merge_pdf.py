"""
pip install pypdf
"""
import os
from pypdf import PdfWriter

def merge_pdfs(input_folder, output_file):
    pdf_writer = PdfWriter()

    # 获取文件夹内所有PDF文件并排序
    pdf_files = [f for f in os.listdir(input_folder) if f.lower().endswith('.pdf')]
    pdf_files.sort()  # 按文件名排序合并

    if not pdf_files:
        print("未找到PDF文件")
        return

    for pdf in pdf_files:
        pdf_path = os.path.join(input_folder, pdf)
        print(f"正在添加: {pdf}")
        pdf_writer.append(pdf_path)

    # 写入输出文件
    with open(output_file, "wb") as out:
        pdf_writer.write(out)

    print(f"\n合并完成！输出文件: {output_file}")


if __name__ == "__main__":
    input_folder = r"."
    output_file = r"horse.pdf"

    merge_pdfs(input_folder, output_file)