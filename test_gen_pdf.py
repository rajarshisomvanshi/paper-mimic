from fpdf import FPDF

def create_pdf():
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", size=12)
    pdf.cell(200, 10, txt="Paper Mimic Test", ln=1, align="C")
    pdf.cell(200, 10, txt="1. What is the capital of France?", ln=1, align="L")
    pdf.cell(200, 10, txt="A. London", ln=1, align="L")
    pdf.cell(200, 10, txt="B. Paris", ln=1, align="L")
    pdf.cell(200, 10, txt="C. Berlin", ln=1, align="L")
    pdf.output("test.pdf")

if __name__ == "__main__":
    create_pdf()
