import type { PatientRecord, PageView } from '../types';
import { getSmearResultStatus } from './date';

declare var XLSX: any;

const getHeaderSuffix = (view: PageView) => {
    switch(view) {
        case 'firstHalf': return 'در شش ماهه اول';
        case 'secondHalf': return 'در شش ماهه دوم';
        case 'annual': return 'در کل سال';
    }
};

const createSheetDataForView = (data: PatientRecord[], view: PageView): (string | number | null)[][] => {
    const headerSuffix = getHeaderSuffix(view);
    const headerRow1 = [
        'ردیف', 'شماره سل', 'تاریخ شروع درمان', 'نتیجه اسمیر ماه دو',
        'مرحله حمله ای (اسمیر منفی/اسمیر مثبت)', null, null, null,
        'مرحله نگهدارنده (اسمیر منفی، اسمیر مثبت)', null, null, null,
        `خلاصه داتس ${headerSuffix}`, null, null
    ];

    const headerRow2 = [
        null, null, null, null,
        `تعداد روزهای نیازمند داتس ${headerSuffix}`, `تعداد روزهای دریافت داتس ${headerSuffix}`, 'درصد پوشش داتس', 'توضیحات',
        `تعداد روزهای نیازمند داتس ${headerSuffix}`, `تعداد روزهای دریافت داتس ${headerSuffix}`, 'درصد پوشش داتس', 'توضیحات',
        `کل روزهای نیازمند داتس ${headerSuffix}`, `کل روزهای دریافت داتس ${headerSuffix}`, `درصد پوشش داتس ${headerSuffix}`
    ];
    
    const bodyRows = data.map((patient, index) => {
        const periodData = patient[view];
        const smearStatus = getSmearResultStatus(patient.smearResultMonth2);
        const patientOutcome = patient.finalOutcome;
        const isContinuationPending = smearStatus === 'در حال انتظار' && !patientOutcome;

        const smearColumnValue = patientOutcome
            ? patientOutcome.status
            : (patient.smearResultMonth2 || smearStatus);

        const intensiveDescription = smearStatus === 'مثبت' && !patientOutcome ? 'اسمیر مثبت' : '';
        const continuationDescription = isContinuationPending ? 'در حال انتظار' : '';

        const formatCoverage = (value: string | null) => (value !== null && value !== '-') ? `${value}%` : value;
        const formatNullable = (value: number | null) => value === null ? '-' : value;

        return [
            index + 1,
            String(patient.tbId), // FIX: Explicitly convert to string to prevent type error and column shift
            patient.treatmentStartDate,
            smearColumnValue,
            // Intensive Phase
            periodData.intensiveRequired,
            periodData.intensiveReceived,
            formatCoverage(periodData.intensiveCoverage),
            intensiveDescription,
            // Continuation Phase
            formatNullable(periodData.continuationRequired),
            formatNullable(periodData.continuationReceived),
            formatCoverage(periodData.continuationCoverage),
            continuationDescription,
            // Summary
            periodData.totalRequired,
            periodData.totalReceived,
            formatCoverage(periodData.totalCoverage),
        ];
    });

    return [headerRow1, headerRow2, ...bodyRows];
};


export const exportToXlsx = (
    data: PatientRecord[],
    views: PageView[],
    filename: string,
    pageTitles: Record<PageView, string>
) => {
    if (typeof XLSX === 'undefined') {
        alert("خطا: کتابخانه مورد نیاز برای تولید فایل اکسل بارگذاری نشده است. لطفاً از اتصال به اینترنت اطمینان حاصل کنید.");
        console.error("XLSX library not found. Make sure the script tag is included in index.html.");
        return;
    }
    if (data.length === 0) {
        alert("داده‌ای برای دانلود وجود ندارد.");
        return;
    }

    const wb = XLSX.utils.book_new();
    // FIX: Set RTL view for the entire workbook to ensure it opens correctly.
    wb.Workbook = { Views: [{ RTL: true }] };

    views.forEach(view => {
        const sheetData = createSheetDataForView(data, view);
        const ws = XLSX.utils.aoa_to_sheet(sheetData);

        // Define merged cells
        ws['!merges'] = [
            // Merging main headers vertically
            { s: { r: 0, c: 0 }, e: { r: 1, c: 0 } }, // ردیف
            { s: { r: 0, c: 1 }, e: { r: 1, c: 1 } }, // شماره سل
            { s: { r: 0, c: 2 }, e: { r: 1, c: 2 } }, // تاریخ شروع درمان
            { s: { r: 0, c: 3 }, e: { r: 1, c: 3 } }, // نتیجه اسمیر ماه دو
            // Merging category headers horizontally
            { s: { r: 0, c: 4 }, e: { r: 0, c: 7 } }, // مرحله حمله ای
            { s: { r: 0, c: 8 }, e: { r: 0, c: 11 } }, // مرحله نگهدارنده
            { s: { r: 0, c: 12 }, e: { r: 0, c: 14 } },// خلاصه داتس
        ];

        const headerStyle = {
            fill: { fgColor: { rgb: "FFFF00" } }, // Yellow
            font: { bold: true, sz: 11, name: "Vazirmatn" },
            alignment: { horizontal: "center", vertical: "center", wrapText: true },
            border: { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } }
        };

        const cellStyle = {
            font: { sz: 10, name: "Vazirmatn" },
            alignment: { horizontal: "center", vertical: "center" },
            border: { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } }
        };
        
        const range = XLSX.utils.decode_range(ws['!ref']!);
        for (let R = range.s.r; R <= range.e.r; ++R) {
            for (let C = range.s.c; C <= range.e.c; ++C) {
                const cell_address = { c: C, r: R };
                const cell_ref = XLSX.utils.encode_cell(cell_address);
                if (!ws[cell_ref]) continue;
                 // Apply styles: Header rows (0 and 1) get headerStyle, others get cellStyle
                ws[cell_ref].s = (R < 2) ? headerStyle : cellStyle;
            }
        }
        
        // Auto-fit column widths
        const colWidths = sheetData[1].map((_, colIndex) => {
            const maxLength = sheetData.reduce((max, row) => {
                const cellValue = row[colIndex] ? String(row[colIndex]) : '';
                return Math.max(max, cellValue.length);
            }, 0);
            return { wch: Math.min(Math.max(maxLength, 10), 40) }; // min width 10, max 40
        });
        ws['!cols'] = colWidths;
        
        // Set RTL direction for the sheet as a fallback
        if (!ws['!props']) ws['!props'] = {};
        ws['!props'].RTL = true;
        
        // Sanitize sheet name
        const sheetName = pageTitles[view].replace(/[\\/*?[\]:]/g, "").substring(0, 31);
        XLSX.utils.book_append_sheet(wb, ws, sheetName);
    });

    XLSX.writeFile(wb, filename);
};