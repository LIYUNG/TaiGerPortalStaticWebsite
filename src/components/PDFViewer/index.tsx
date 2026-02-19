import { useState, useRef, type ReactElement } from 'react';
import { pdfjs, Document, Page } from 'react-pdf';
import { Box, Button, Typography } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';

import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import { getPDFQuery } from '@/api/query';
import { useQuery } from '@tanstack/react-query';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

const PDFViewer = (apiFilePath: string, path: string): ReactElement => {
    const { data: pdfData, isLoading } = useQuery(getPDFQuery(apiFilePath));
    const [pageWidth, setPageWidth] = useState<number | null>(null);
    const [numPages, setNumPages] = useState<number | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);

    const onDocumentLoadSuccess = ({
        numPages: pages
    }: {
        numPages: number;
    }) => {
        setNumPages(pages);
        setPageWidth(
            containerRef.current ? containerRef.current.offsetWidth - 30 : null
        );
    };

    const handleZoomIn = () => {
        setZoomLevel((z) => z * 1.414);
    };

    const handleZoomOut = () => {
        setZoomLevel((z) => (z > 0.2 ? z / 1.414 : z));
    };

    const handleDownload = () => {
        if (!pdfData) return;
        const downloadLink = document.createElement('a');
        downloadLink.href = URL.createObjectURL(pdfData as Blob);
        const fileName = path.split('/').pop() ?? 'document.pdf';
        downloadLink.download = fileName;
        downloadLink.click();
    };

    const handleScroll = () => {
        if (!containerRef.current || numPages == null) return;
        const container = containerRef.current;
        const scrollPosition = container.scrollTop;
        const pageHeight = container.scrollHeight / numPages;
        const newPage = Math.floor(scrollPosition / pageHeight) + 1;
        setCurrentPage(newPage);
    };

    return (
        <Box>
            {isLoading ? (
                <Box>Loading PDF...</Box>
            ) : (
                <>
                    <Box
                        onScroll={handleScroll}
                        ref={containerRef}
                        style={{ height: '60vh', overflow: 'auto' }}
                    >
                        <Document
                            file={pdfData}
                            onLoadError={console.error}
                            onLoadSuccess={onDocumentLoadSuccess}
                        >
                            {numPages != null &&
                                Array.from(new Array(numPages), (_, index) => (
                                    <Page
                                        key={`page_${index + 1}`}
                                        pageNumber={index + 1}
                                        renderTextLayer={false}
                                        scale={zoomLevel}
                                        width={pageWidth ?? undefined}
                                    />
                                ))}
                        </Document>
                    </Box>
                    <Box sx={{ mx: 2 }}>
                        <Typography>
                            {currentPage} of {numPages}
                        </Typography>
                        <Box>
                            <Button
                                onClick={handleZoomIn}
                                size="small"
                                startIcon={<ZoomInIcon />}
                                variant="outlined"
                            />
                            <Button
                                onClick={handleZoomOut}
                                size="small"
                                startIcon={<ZoomOutIcon />}
                                variant="outlined"
                            />
                            <Button
                                onClick={handleDownload}
                                size="small"
                                startIcon={<DownloadIcon />}
                                variant="outlined"
                            />
                        </Box>
                    </Box>
                </>
            )}
        </Box>
    );
};

export default PDFViewer;
