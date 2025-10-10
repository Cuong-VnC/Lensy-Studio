
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { GoogleGenAI, GenerateContentResponse, Part, Modality } from '@google/genai';
import { GeneratedImage, HistoryItem } from '../types';
import { UserPlusIcon, SparklesIcon, ShoppingBagIcon, UsersIcon, PencilIcon, ChevronLeftIcon, BackspaceIcon, HeartIcon, ClockIcon, PhotoIcon, SpeakerWaveIcon, XIcon } from '../components/Icons';
import ApiKeyModal from '../components/ApiKeyModal';
import { FACE_SWAP_PROMPT } from '../prompts/face_swap';
import { REMOVE_BACKGROUND_PROMPT } from '../prompts/remove_background';
import { POSTER_CREATION_PROMPT } from '../prompts/poster_creation';
import { ONLINE_TRY_ON_PROMPT } from '../prompts/online_try_on';
import { RESTORE_OLD_PHOTO_PROMPT } from '../prompts/restore_old_photo';
import { SALES_KOL_PROMPT } from '../prompts/sales_kol';
import { WEDDING_PROMPT } from '../prompts/wedding_photoshoot';
import { VIRTUAL_KOL_PROMPT } from '../prompts/virtual_kol';
import { CONCEPT_PROMPTS_MAP } from '../prompts/concept_photoshoot';


// Utility to convert file to base64
const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = error => reject(error);
    });
};

const createThumbnail = (base64Data: string, mimeType: string, maxWidth: number = 200, maxHeight: number = 200): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;

            if (width > height) {
                if (width > maxWidth) {
                    height *= maxWidth / width;
                    width = maxWidth;
                }
            } else {
                if (height > maxHeight) {
                    width *= maxHeight / height;
                    height = maxHeight;
                }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                return reject(new Error('Could not get canvas context'));
            }
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.8).split(',')[1]);
        };
        img.onerror = reject;
        img.src = `data:${mimeType};base64,${base64Data}`;
    });
};


const Spinner: React.FC = () => (
    <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
    </div>
);

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string; onTryNow: () => void; }> = ({ icon, title, description, onTryNow }) => (
    <div className="w-full sm:w-64 bg-white dark:bg-slate-800/90 p-6 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 flex flex-col items-center text-center transition-all duration-300 hover:shadow-purple-500/20 hover:-translate-y-1">
      <div className="mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{title}</h3>
      <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 flex-grow">{description}</p>
      <button
        onClick={onTryNow}
        className="w-full bg-yellow-300 text-yellow-900 font-semibold py-2 px-4 rounded-lg hover:bg-yellow-400 transition-colors duration-200 dark:bg-yellow-400 dark:text-yellow-900 dark:hover:bg-yellow-500"
      >
        Thử ngay
      </button>
    </div>
  );

const StudioPage: React.FC = () => {
    // General State
    const [prompt, setPrompt] = useState<string>('');
    const [generatedImage, setGeneratedImage] = useState<GeneratedImage | null>(null);
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [activeFeature, setActiveFeature] = useState<string | null>(null);
    const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState<boolean>(false);
    const [downloadQuality, setDownloadQuality] = useState<'HD' | '2K' | '4K'>('HD');
    const navigate = useNavigate();
    const location = useLocation();

    // Feature-specific image states
    const [baseImage, setBaseImage] = useState<{ file: File, preview: string, mimeType: string } | null>(null);
    const [customImages, setCustomImages] = useState<Array<{ file: File; preview: string; mimeType: string }>>([]);
    const [faceImage, setFaceImage] = useState<{ file: File, preview: string, mimeType: string } | null>(null);
    const [posterImages, setPosterImages] = useState<Array<{ file: File; preview: string; mimeType: string }>>([]);
    const [oldPhotoImage, setOldPhotoImage] = useState<{ file: File, preview: string, mimeType: string } | null>(null);
    const [onlineTryOnModel, setOnlineTryOnModel] = useState<{ file: File, preview: string, mimeType: string } | null>(null);
    const [onlineTryOnHair, setOnlineTryOnHair] = useState<{ file: File, preview: string, mimeType: string } | null>(null);
    const [onlineTryOnTop, setOnlineTryOnTop] = useState<{ file: File, preview: string, mimeType: string } | null>(null);
    const [onlineTryOnPants, setOnlineTryOnPants] = useState<{ file: File, preview: string, mimeType: string } | null>(null);
    const [onlineTryOnShoes, setOnlineTryOnShoes] = useState<{ file: File, preview: string, mimeType: string } | null>(null);
    const [onlineTryOnAccessory, setOnlineTryOnAccessory] = useState<{ file: File, preview: string, mimeType: string } | null>(null);
    const [kolImage, setKolImage] = useState<{ file: File, preview: string, mimeType: string } | null>(null);
    const [productImages, setProductImages] = useState<Array<{ file: File; preview: string; mimeType: string }>>([]);
    const [groomImage, setGroomImage] = useState<{ file: File, preview: string, mimeType: string } | null>(null);
    const [brideImage, setBrideImage] = useState<{ file: File, preview: string, mimeType: string } | null>(null);
    const [weddingConceptImages, setWeddingConceptImages] = useState<Array<{ file: File; preview: string; mimeType: string }>>([]);
    const [generatedWeddingImages, setGeneratedWeddingImages] = useState<GeneratedImage[]>([]);
    const [selectedWeddingImage, setSelectedWeddingImage] = useState<GeneratedImage | null>(null);
    const [virtualKolImage, setVirtualKolImage] = useState<{ file: File, preview: string, mimeType: string } | null>(null);
    const [generatedVirtualKolImages, setGeneratedVirtualKolImages] = useState<GeneratedImage[]>([]);
    const [selectedVirtualKolImage, setSelectedVirtualKolImage] = useState<GeneratedImage | null>(null);
    const [conceptImage, setConceptImage] = useState<{ file: File, preview: string, mimeType: string } | null>(null);
    const [selectedConcept, setSelectedConcept] = useState<string>('');
    const [generatedConceptImages, setGeneratedConceptImages] = useState<GeneratedImage[]>([]);
    const [selectedConceptImage, setSelectedConceptImage] = useState<GeneratedImage | null>(null);


    useEffect(() => {
        const savedHistory = localStorage.getItem('lensy-history');
        if (savedHistory) {
            try {
                const parsedHistory = JSON.parse(savedHistory);
                if (Array.isArray(parsedHistory) && (parsedHistory.length === 0 || parsedHistory[0].thumbnail)) {
                    setHistory(parsedHistory);
                } else {
                    console.warn('Định dạng lịch sử cũ hoặc không hợp lệ. Đang xóa lịch sử.');
                    localStorage.removeItem('lensy-history');
                }
            } catch (e) {
                console.error('Không thể phân tích lịch sử từ localStorage. Đang xóa lịch sử.', e);
                localStorage.removeItem('lensy-history');
            }
        }
    }, []);

    // This effect handles navigation from the Prompts page
    useEffect(() => {
        if (location.state?.feature === 'custom' && typeof location.state?.prompt === 'string') {
            resetAllInputs();
            setActiveFeature(location.state.feature);
            setPrompt(location.state.prompt);
            // Clear location state to prevent re-triggering
            navigate('.', { replace: true, state: {} });
        }
    }, [location.state, navigate]);


    const resetAllInputs = () => {
        setBaseImage(null);
        setCustomImages([]);
        setFaceImage(null);
        setPosterImages([]);
        setGeneratedImage(null);
        setGeneratedWeddingImages([]);
        setSelectedWeddingImage(null);
        setError(null);
        setPrompt('');
        setOldPhotoImage(null);
        setOnlineTryOnModel(null);
        setOnlineTryOnHair(null);
        setOnlineTryOnTop(null);
        setOnlineTryOnPants(null);
        setOnlineTryOnShoes(null);
        setOnlineTryOnAccessory(null);
        setKolImage(null);
        setProductImages([]);
        setGroomImage(null);
        setBrideImage(null);
        setWeddingConceptImages([]);
        setVirtualKolImage(null);
        setGeneratedVirtualKolImages([]);
        setSelectedVirtualKolImage(null);
        setConceptImage(null);
        setSelectedConcept('');
        setGeneratedConceptImages([]);
        setSelectedConceptImage(null);
    };

    const handleFeatureSelect = (featureTitle: string) => {
        const userApiKey = localStorage.getItem('gemini-api-key');
        if (!userApiKey || userApiKey.trim() === '') {
            setIsApiKeyModalOpen(true);
        } else {
            resetAllInputs();
            
            const featureMap: { [key: string]: string } = {
                'Tạo KOL ảo': 'virtual-kol',
                'Chụp ảnh theo concept': 'concept-photoshoot',
                'Chụp ảnh tuỳ chỉnh': 'custom',
                'Xoá nền': 'remove-background',
                'Đổi mặt': 'face-swap',
                'Tạo poster': 'poster-creation',
                'Thử đồ online': 'online-try-on',
                'Phục hồi ảnh cũ': 'restore-old-photo',
                'Tạo KOL bán hàng': 'sales-kol',
                'Chụp ảnh cưới': 'wedding-photoshoot',
            };

            setActiveFeature(featureMap[featureTitle] || 'custom');
        }
    };
    
    const handleNavigateToSettings = () => {
        setIsApiKeyModalOpen(false);
        navigate('/settings');
    };

    const createImageUploadHandler = (setter: React.Dispatch<React.SetStateAction<{ file: File; preview: string; mimeType: string; } | null>>) => 
        (event: React.ChangeEvent<HTMLInputElement>) => {
            const file = event.target.files?.[0];
            if (file) {
                setter({
                    file,
                    preview: URL.createObjectURL(file),
                    mimeType: file.type
                });
                setGeneratedImage(null);
                setGeneratedWeddingImages([]);
                setSelectedWeddingImage(null);
                setGeneratedVirtualKolImages([]);
                setSelectedVirtualKolImage(null);
                setGeneratedConceptImages([]);
                setSelectedConceptImage(null);
                setError(null);
            }
        };

    const handleBaseImageUpload = createImageUploadHandler(setBaseImage);
    const handleFaceImageUpload = createImageUploadHandler(setFaceImage);
    const handleOldPhotoImageUpload = createImageUploadHandler(setOldPhotoImage);
    const handleKolImageUpload = createImageUploadHandler(setKolImage);
    const handleGroomImageUpload = createImageUploadHandler(setGroomImage);
    const handleBrideImageUpload = createImageUploadHandler(setBrideImage);
    const handleOnlineTryOnModelUpload = createImageUploadHandler(setOnlineTryOnModel);
    const handleOnlineTryOnHairUpload = createImageUploadHandler(setOnlineTryOnHair);
    const handleOnlineTryOnTopUpload = createImageUploadHandler(setOnlineTryOnTop);
    const handleOnlineTryOnPantsUpload = createImageUploadHandler(setOnlineTryOnPants);
    const handleOnlineTryOnShoesUpload = createImageUploadHandler(setOnlineTryOnShoes);
    const handleOnlineTryOnAccessoryUpload = createImageUploadHandler(setOnlineTryOnAccessory);
    const handleVirtualKolImageUpload = createImageUploadHandler(setVirtualKolImage);
    const handleConceptImageUpload = createImageUploadHandler(setConceptImage);
    
    const createMultiImageUploadHandler = (setter: React.Dispatch<React.SetStateAction<Array<{ file: File; preview: string; mimeType: string }>>>) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files) {
            const newImages = Array.from(files).map(file => ({
                file,
                preview: URL.createObjectURL(file),
                mimeType: file.type
            }));
            setter(prev => [...prev, ...newImages]);
            setGeneratedImage(null);
            setGeneratedWeddingImages([]);
            setSelectedWeddingImage(null);
            setError(null);
        }
    };

    const handleCustomImagesUpload = createMultiImageUploadHandler(setCustomImages);
    const handlePosterImageUpload = createMultiImageUploadHandler(setPosterImages);
    const handleProductImagesUpload = createMultiImageUploadHandler(setProductImages);
    const handleWeddingConceptImagesUpload = createMultiImageUploadHandler(setWeddingConceptImages);
    
    const removeCustomImage = (index: number) => {
        setCustomImages(prev => prev.filter((_, i) => i !== index));
    };

    const removePosterImage = (index: number) => {
        setPosterImages(prev => prev.filter((_, i) => i !== index));
    };

    const removeProductImage = (index: number) => {
        setProductImages(prev => prev.filter((_, i) => i !== index));
    };
    
    const removeWeddingConceptImage = (index: number) => {
        setWeddingConceptImages(prev => prev.filter((_, i) => i !== index));
    };


    const addToHistory = async (item: { prompt: string; generatedImage: GeneratedImage }) => {
        try {
            const thumbnailData = await createThumbnail(item.generatedImage.data, item.generatedImage.mimeType);
            const newItem: HistoryItem = {
                id: Date.now().toString(),
                prompt: item.prompt,
                thumbnail: {
                    data: thumbnailData,
                    mimeType: 'image/jpeg'
                }
            };

            setHistory(prevHistory => {
                const newHistory = [newItem, ...prevHistory].slice(0, 10);

                for (let i = 0; i < newHistory.length; i++) {
                    const historyToTry = newHistory.slice(0, newHistory.length - i);
                    try {
                        localStorage.setItem('lensy-history', JSON.stringify(historyToTry));
                        return historyToTry;
                    } catch (e) {
                        if (e instanceof DOMException && (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
                            console.warn(`Vượt quá hạn ngạch. Đang thử lưu ${historyToTry.length - 1} mục.`);
                        } else {
                            console.error('Không thể lưu lịch sử vào localStorage', e);
                            setError('Không thể lưu lịch sử vào bộ nhớ cục bộ.');
                            return prevHistory;
                        }
                    }
                }
                localStorage.removeItem('lensy-history');
                return [];
            });
        } catch (error) {
            console.error('Không thể tạo ảnh thu nhỏ cho lịch sử', error);
            setError('Không thể tạo ảnh thu nhỏ cho lịch sử.');
        }
    };

    const processApiRequest = async (parts: Part[], historyPrompt: string) => {
        const userApiKey = localStorage.getItem('gemini-api-key');
        const apiKey = userApiKey || (process.env.API_KEY as string);
    
        if (!apiKey || apiKey.trim() === '') {
            setError('Thiếu API Key. Vui lòng thêm khóa của riêng bạn trong trang Cài đặt hoặc thử lại.');
            return;
        }
    
        setIsLoading(true);
        setError(null);
        setGeneratedImage(null);
        setGeneratedWeddingImages([]);
        setSelectedWeddingImage(null);
        setGeneratedVirtualKolImages([]);
        setSelectedVirtualKolImage(null);
        setGeneratedConceptImages([]);
        setSelectedConceptImage(null);
    
        try {
            const ai = new GoogleGenAI({ apiKey });
            const response: GenerateContentResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image-preview',
                contents: { parts },
                config: {
                    responseModalities: [Modality.IMAGE, Modality.TEXT],
                },
            });
    
            const imageParts = response.candidates?.[0]?.content?.parts?.filter(part => part.inlineData) || [];
    
            if (imageParts.length > 0) {
                const newImage: GeneratedImage = {
                    data: imageParts[0].inlineData!.data,
                    mimeType: imageParts[0].inlineData!.mimeType,
                };
                setGeneratedImage(newImage);
                addToHistory({
                    prompt: historyPrompt,
                    generatedImage: newImage,
                });
            } else {
                const textResponse = response.text?.trim();
                setError(`AI không trả về hình ảnh. Phản hồi: ${textResponse || 'Không có phản hồi văn bản.'}. Vui lòng thử lại.`);
            }
        } catch (e) {
            console.error(e);
            setError('Đã xảy ra lỗi khi tạo hình ảnh. Vui lòng kiểm tra API key của bạn và thử lại.');
        } finally {
            setIsLoading(false);
        }
    };

    const processApiStreamRequest = async (parts: Part[], historyPrompt: string, featureType: 'wedding-photoshoot' | 'virtual-kol' | 'concept-photoshoot') => {
        const userApiKey = localStorage.getItem('gemini-api-key');
        const apiKey = userApiKey || (process.env.API_KEY as string);

        if (!apiKey || apiKey.trim() === '') {
            setError('Thiếu API Key. Vui lòng thêm khóa của riêng bạn trong trang Cài đặt hoặc thử lại.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setGeneratedImage(null);
        setGeneratedWeddingImages([]);
        setSelectedWeddingImage(null);
        setGeneratedVirtualKolImages([]);
        setSelectedVirtualKolImage(null);
        setGeneratedConceptImages([]);
        setSelectedConceptImage(null);

        try {
            const ai = new GoogleGenAI({ apiKey });
            const response = await ai.models.generateContentStream({
                model: 'gemini-2.5-flash-image-preview',
                contents: { parts },
                config: {
                    responseModalities: [Modality.IMAGE, Modality.TEXT],
                },
            });

            let isFirstImage = true;
            let foundImage = false;
            let accumulatedTextError = '';

            for await (const chunk of response) {
                const imageParts = chunk.candidates?.[0]?.content?.parts?.filter(part => part.inlineData) || [];

                if (imageParts.length > 0) {
                    foundImage = true;
                    for (const part of imageParts) {
                        const newImage: GeneratedImage = {
                            data: part.inlineData!.data,
                            mimeType: part.inlineData!.mimeType,
                        };

                        if (featureType === 'wedding-photoshoot') {
                            setGeneratedWeddingImages(prev => [...prev, newImage]);
                            if (isFirstImage) {
                                setSelectedWeddingImage(newImage);
                            }
                        } else if (featureType === 'virtual-kol') {
                            setGeneratedVirtualKolImages(prev => [...prev, newImage]);
                            if (isFirstImage) {
                                setSelectedVirtualKolImage(newImage);
                            }
                        } else if (featureType === 'concept-photoshoot') {
                            setGeneratedConceptImages(prev => [...prev, newImage]);
                            if (isFirstImage) {
                                setSelectedConceptImage(newImage);
                            }
                        }


                        if (isFirstImage) {
                            addToHistory({
                                prompt: historyPrompt,
                                generatedImage: newImage,
                            });
                            isFirstImage = false;
                        }
                    }
                }
                
                const textResponse = chunk.text?.trim();
                if (imageParts.length === 0 && textResponse) {
                    accumulatedTextError += textResponse + ' ';
                }
            }

            if (!foundImage && accumulatedTextError) {
                setError(`AI không trả về hình ảnh. Phản hồi: ${accumulatedTextError}. Vui lòng thử lại.`);
            } else if (!foundImage) {
                 setError(`AI không trả về hình ảnh. Vui lòng thử lại.`);
            }

        } catch (e) {
            console.error(e);
            setError('Đã xảy ra lỗi khi tạo hình ảnh. Vui lòng kiểm tra API key của bạn và thử lại.');
        } finally {
            setIsLoading(false);
        }
    };
    

    const handleGenerate = async () => {
        if (!prompt) {
            setError('Vui lòng nhập mô tả.');
            return;
        }
        if (customImages.length === 0) {
            setError('Vui lòng tải lên ít nhất một hình ảnh.');
            return;
        }

        const base64Promises = customImages.map(img => fileToBase64(img.file));
        const base64DataArray = await Promise.all(base64Promises);

        const imageParts: Part[] = base64DataArray.map((data, index) => ({
            inlineData: { data, mimeType: customImages[index].mimeType }
        }));
        
        const textPart: Part = { text: prompt };
        processApiRequest([...imageParts, textPart], prompt);
    };

    const handleRemoveBackground = async () => {
        if (!baseImage) {
            setError('Vui lòng tải lên một hình ảnh.');
            return;
        }
        const base64Data = await fileToBase64(baseImage.file);
        const imagePart: Part = { inlineData: { data: base64Data, mimeType: baseImage.mimeType } };
        const textPart: Part = { text: REMOVE_BACKGROUND_PROMPT };
        processApiRequest([imagePart, textPart], "Xoá nền");
    };

    const handleFaceSwap = async () => {
        if (!baseImage || !faceImage) {
            setError('Vui lòng tải lên cả ảnh người mẫu và ảnh khuôn mặt.');
            return;
        }
        const base64Base = await fileToBase64(baseImage.file);
        const base64Face = await fileToBase64(faceImage.file);
        const baseImagePart: Part = { inlineData: { data: base64Base, mimeType: baseImage.mimeType } };
        const faceImagePart: Part = { inlineData: { data: base64Face, mimeType: faceImage.mimeType } };
        const textPart: Part = { text: FACE_SWAP_PROMPT };
        processApiRequest([baseImagePart, faceImagePart, textPart], "Đổi mặt");
    };

    const handleCreatePoster = async () => {
        if (posterImages.length === 0) {
            setError('Vui lòng tải lên ít nhất một hình ảnh cho poster.');
            return;
        }
        if (!prompt) {
            setError('Vui lòng nhập ý tưởng cho poster.');
            return;
        }

        const base64Promises = posterImages.map(img => fileToBase64(img.file));
        const base64DataArray = await Promise.all(base64Promises);

        const imageParts: Part[] = base64DataArray.map((data, index) => ({
            inlineData: { data, mimeType: posterImages[index].mimeType }
        }));

        const combinedPrompt = `${POSTER_CREATION_PROMPT}\n\nCreative Brief: "${prompt}"`;
        const textPart: Part = { text: combinedPrompt };

        const allParts = [...imageParts, textPart];
        processApiRequest(allParts, `Tạo poster: ${prompt}`);
    };

    const handleRestoreOldPhoto = async () => {
        if (!oldPhotoImage) {
            setError('Vui lòng tải lên một ảnh cũ.');
            return;
        }
    
        const base64Data = await fileToBase64(oldPhotoImage.file);
        const imagePart: Part = { inlineData: { data: base64Data, mimeType: oldPhotoImage.mimeType } };
        
        let combinedPrompt = RESTORE_OLD_PHOTO_PROMPT;
        if (prompt) {
            combinedPrompt += `\n\nYêu cầu bổ sung từ người dùng: "${prompt}"`;
        }
        
        const textPart: Part = { text: combinedPrompt };
        
        processApiRequest([imagePart, textPart], `Phục hồi ảnh cũ: ${prompt || 'Tự động'}`);
    };

    const handleCreateSalesKol = async () => {
        if (!kolImage || productImages.length === 0) {
            setError('Vui lòng tải lên ảnh KOL và ít nhất một ảnh sản phẩm.');
            return;
        }
    
        const allImages = [kolImage, ...productImages];
        const base64Promises = allImages.map(img => fileToBase64(img!.file));
        const base64DataArray = await Promise.all(base64Promises);
    
        const imageParts: Part[] = base64DataArray.map((data, index) => ({
            inlineData: { data, mimeType: allImages[index]!.mimeType }
        }));
        
        let combinedPrompt = SALES_KOL_PROMPT;
        if (prompt) {
            combinedPrompt += `\n\nYêu cầu bổ sung từ người dùng: "${prompt}"`;
        }
    
        const textPart: Part = { text: combinedPrompt };
    
        // The prompt should go first to give context to the AI before it sees the images.
        const allParts = [textPart, ...imageParts];
        processApiRequest(allParts, `Tạo KOL bán hàng: ${prompt || 'Tự động'}`);
    };

    const handleCreateWeddingPhotoshoot = async () => {
        if (!groomImage || !brideImage) {
            setError('Vui lòng tải lên cả ảnh chú rể và ảnh cô dâu.');
            return;
        }
    
        const allImages = [groomImage, brideImage, ...weddingConceptImages];
        const base64Promises = allImages.map(img => fileToBase64(img!.file));
        const base64DataArray = await Promise.all(base64Promises);
    
        const imageParts: Part[] = base64DataArray.map((data, index) => ({
            inlineData: { data, mimeType: allImages[index]!.mimeType }
        }));
    
        let combinedPrompt = WEDDING_PROMPT;
        if (prompt) {
            combinedPrompt += `\n\nYêu cầu bổ sung từ người dùng: "${prompt}"`;
        }
    
        const textPart: Part = { text: combinedPrompt };
    
        // The prompt should go first to give context.
        const allParts = [textPart, ...imageParts];
        processApiStreamRequest(allParts, `Chụp ảnh cưới: ${prompt || 'Tự động'}`, 'wedding-photoshoot');
    };
    
    const handleOnlineTryOn = async () => {
        if (!onlineTryOnModel) {
            setError('Vui lòng tải lên ảnh người mẫu.');
            return;
        }
    
        const items = [
            onlineTryOnHair,
            onlineTryOnTop,
            onlineTryOnPants,
            onlineTryOnShoes,
            onlineTryOnAccessory,
        ].filter(Boolean);
    
        if (items.length === 0) {
            setError('Vui lòng tải lên ít nhất một món đồ để thử.');
            return;
        }
    
        const allImages = [onlineTryOnModel, ...items];
        const base64Promises = allImages.map(img => fileToBase64(img!.file));
        const base64DataArray = await Promise.all(base64Promises);
    
        const imageParts: Part[] = base64DataArray.map((data, index) => ({
            inlineData: { data, mimeType: allImages[index]!.mimeType }
        }));
        
        let textPromptContent = ONLINE_TRY_ON_PROMPT;
        if (prompt) {
            textPromptContent += `\n\nYêu cầu tùy chọn từ người dùng: "${prompt}"`;
        }
    
        const textPart: Part = { text: textPromptContent };
    
        const allParts = [...imageParts, textPart];
        processApiRequest(allParts, `Thử đồ online: ${prompt || 'kết hợp các món đồ'}`);
    };

    const handleCreateVirtualKol = async () => {
        if (!virtualKolImage) {
            setError('Vui lòng tải lên ảnh mẫu.');
            return;
        }

        const base64Data = await fileToBase64(virtualKolImage.file);
        const imagePart: Part = { inlineData: { data: base64Data, mimeType: virtualKolImage.mimeType } };

        let combinedPrompt = VIRTUAL_KOL_PROMPT;
        if (prompt) {
            combinedPrompt += `\n\nYêu cầu bổ sung từ người dùng: "${prompt}"`;
        }

        const textPart: Part = { text: combinedPrompt };

        processApiStreamRequest([imagePart, textPart], `Tạo KOL ảo: ${prompt || 'Tự động'}`, 'virtual-kol');
    };

    const handleCreateConceptPhotoshoot = async () => {
        if (!conceptImage) {
            setError('Vui lòng tải lên ảnh của bạn.');
            return;
        }
        if (!selectedConcept) {
            setError('Vui lòng chọn một concept.');
            return;
        }

        const base64Data = await fileToBase64(conceptImage.file);
        const imagePart: Part = { inlineData: { data: base64Data, mimeType: conceptImage.mimeType } };
        
        const conceptPrompt = CONCEPT_PROMPTS_MAP[selectedConcept];
        if (!conceptPrompt) {
            setError(`Không tìm thấy prompt cho concept: ${selectedConcept}`);
            return;
        }

        let combinedPrompt = conceptPrompt;
        if (prompt) {
            combinedPrompt += `\n\n**Yêu cầu bổ sung từ người dùng:** "${prompt}"`;
        }

        const textPart: Part = { text: combinedPrompt };

        processApiStreamRequest(
            [imagePart, textPart], 
            `Concept: ${selectedConcept}${prompt ? ` - ${prompt}` : ''}`, 
            'concept-photoshoot'
        );
    };

    const conceptPrompts = [
        "thêm một đường chân trời thành phố tương lai vào nền",
        "biến nó thành một bức tranh màu nước",
        "cho chủ thể đeo kính râm",
        "thêm một chú Corgi dễ thương ngồi cạnh người",
        "thay đổi mùa sang cảnh quan mùa đông có tuyết",
    ];

    const features = [
        {
          icon: <UserPlusIcon className="w-10 h-10 text-purple-500 dark:text-purple-400" />,
          title: 'Tạo KOL ảo',
          description: 'Biến hình minh hoạ 2D thành một mô hình nhân vật 3D trông như thật.',
        },
        {
          icon: <SparklesIcon className="w-10 h-10 text-purple-500 dark:text-purple-400" />,
          title: 'Chụp ảnh theo concept',
          description: 'Biến những bức ảnh bình thường thành tác phẩm nghệ thuật theo chủ đề bạn muốn.',
        },
        {
            icon: <HeartIcon className="w-10 h-10 text-purple-500 dark:text-purple-400" />,
            title: 'Chụp ảnh cưới',
            description: 'Tạo ra những bức ảnh cưới đẹp như mơ với các hiệu ứng và phong cách lãng mạn.',
        },
        {
            icon: <ClockIcon className="w-10 h-10 text-purple-500 dark:text-purple-400" />,
            title: 'Phục hồi ảnh cũ',
            description: 'Khôi phục màu sắc, độ nét và sửa chữa hư hỏng cho những bức ảnh kỷ niệm cũ của bạn.',
        },
        {
          icon: <ShoppingBagIcon className="w-10 h-10 text-purple-500 dark:text-purple-400" />,
          title: 'Thử đồ online',
          description: 'Xem trang phục mới sẽ trông như thế nào trên ảnh của bạn chỉ với một vài cú nhấp chuột.',
        },
        {
            icon: <SpeakerWaveIcon className="w-10 h-10 text-purple-500 dark:text-purple-400" />,
            title: 'Tạo KOL bán hàng',
            description: 'Tạo người mẫu ảo chuyên nghiệp để quảng bá sản phẩm của bạn trên mạng xã hội.',
        },
        {
            icon: <PhotoIcon className="w-10 h-10 text-purple-500 dark:text-purple-400" />,
            title: 'Tạo poster',
            description: 'Biến ảnh của bạn thành poster phim, quảng cáo hoặc nghệ thuật chỉ trong vài giây.',
        },
        {
          icon: <UsersIcon className="w-10 h-10 text-purple-500 dark:text-purple-400" />,
          title: 'Đổi mặt',
          description: 'Hoán đổi khuôn mặt trong ảnh một cách liền mạch và vui nhộn cho mục đích giải trí.',
        },
        {
            icon: <BackspaceIcon className="w-10 h-10 text-purple-500 dark:text-purple-400" />,
            title: 'Xoá nền',
            description: 'Loại bỏ nền khỏi bất kỳ hình ảnh nào một cách chính xác để làm nổi bật chủ thể.',
        },
        {
          icon: <PencilIcon className="w-10 h-10 text-purple-500 dark:text-purple-400" />,
          title: 'Chụp ảnh tuỳ chỉnh',
          description: 'Sân chơi sáng tạo của bạn. Chỉnh sửa tự do với mọi công cụ và khả năng của AI.',
        },
      ];

    if (activeFeature) {
        let title = '';
        let description = '';
        let editorContent = null;

        const resultDisplay = (
            <div className="flex-grow flex items-center justify-center">
                {isLoading && generatedWeddingImages.length === 0 && generatedVirtualKolImages.length === 0 && generatedConceptImages.length === 0 && <Spinner />}
                {error && <p className="text-red-500 text-center">{error}</p>}
                {generatedImage && (
                    <img src={`data:${generatedImage.mimeType};base64,${generatedImage.data}`} alt="Generated" className="max-w-full max-h-96 lg:max-h-[500px] rounded-lg mx-auto" />
                )}
                {!isLoading && !error && !generatedImage && generatedWeddingImages.length === 0 && generatedVirtualKolImages.length === 0 && generatedConceptImages.length === 0 &&(
                    <div className="text-center text-slate-500 dark:text-slate-400">
                        <PhotoIcon className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600" />
                        <p className="mt-2">Hình ảnh đã xử lý sẽ xuất hiện ở đây.</p>
                    </div>
                )}
            </div>
        );
        
        const singleUploadPanel = (title: string, image: { preview: string } | null, handleUpload: (event: React.ChangeEvent<HTMLInputElement>) => void, inputId: string) => (
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{title}</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 dark:border-slate-600 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                        {image ? (
                            <img src={image.preview} alt="Original" className="mx-auto h-40 w-auto rounded-lg" />
                        ) : (
                            <PhotoIcon className="mx-auto h-12 w-12 text-slate-400" />
                        )}
                        <div className="flex text-sm text-slate-600 dark:text-slate-400">
                            <label htmlFor={inputId} className="relative cursor-pointer bg-white dark:bg-slate-800 rounded-md font-medium text-purple-600 hover:text-purple-500 dark:text-purple-400 dark:hover:text-purple-300 focus-within:outline-none">
                                <span>{image ? 'Thay đổi ảnh' : 'Tải lên một tệp'}</span>
                                <input id={inputId} name={inputId} type="file" className="sr-only" accept="image/*" onChange={handleUpload} />
                            </label>
                            <p className="pl-1">hoặc kéo và thả</p>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-500">PNG, JPG, GIF tối đa 10MB</p>
                    </div>
                </div>
            </div>
        );

        const MultiImageUploadPanel: React.FC<{
            title: string;
            images: Array<{ preview: string }>;
            onUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
            onRemove: (index: number) => void;
            inputId: string;
        }> = ({ title, images, onUpload, onRemove, inputId }) => (
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{title}</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 dark:border-slate-600 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                        <PhotoIcon className="mx-auto h-12 w-12 text-slate-400" />
                        <div className="flex text-sm text-slate-600 dark:text-slate-400">
                            <label htmlFor={inputId} className="relative cursor-pointer bg-white dark:bg-slate-800 rounded-md font-medium text-purple-600 hover:text-purple-500 dark:text-purple-400 dark:hover:text-purple-300 focus-within:outline-none">
                                <span>Chọn một hoặc nhiều tệp</span>
                                <input id={inputId} name={inputId} type="file" className="sr-only" accept="image/*" multiple onChange={onUpload} />
                            </label>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-500">PNG, JPG, GIF tối đa 10MB mỗi tệp</p>
                    </div>
                </div>
                {images.length > 0 && (
                    <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 gap-4">
                        {images.map((image, index) => (
                            <div key={index} className="relative group">
                                <img src={image.preview} alt={`Asset ${index + 1}`} className="w-full h-24 object-cover rounded-md" />
                                <button onClick={() => onRemove(index)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Remove image">
                                    <XIcon className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
        

        const DownloadSection: React.FC<{
            generatedImage: GeneratedImage | null;
            downloadQuality: 'HD' | '2K' | '4K';
            setDownloadQuality: (quality: 'HD' | '2K' | '4K') => void;
            fileNamePrefix: string;
        }> = ({ generatedImage, downloadQuality, setDownloadQuality, fileNamePrefix }) => (
            <div className="mt-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Chất lượng tải xuống:</label>
                    <div className="grid grid-cols-3 gap-2">
                        {(['HD', '2K', '4K'] as const).map(quality => (
                            <button
                                key={quality}
                                onClick={() => setDownloadQuality(quality)}
                                className={`px-3 py-2 text-sm rounded-md transition-colors ${downloadQuality === quality ? 'bg-purple-600 text-white' : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600'}`}
                            >
                                {quality}
                            </button>
                        ))}
                    </div>
                </div>
                <a
                    href={generatedImage ? `data:${generatedImage.mimeType};base64,${generatedImage.data}`: '#'}
                    download={generatedImage ? `lensy-${fileNamePrefix}-${Date.now()}.png` : undefined}
                    className={`mt-4 w-full inline-block text-center bg-emerald-400 text-emerald-900 font-bold py-3 px-6 rounded-full hover:bg-emerald-500 transition-colors ${!generatedImage ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    Tải ngay ({downloadQuality})
                </a>
            </div>
        );

        if (activeFeature === 'custom') {
            title = 'Trình chỉnh sửa tùy chỉnh';
            description = 'Tải ảnh lên, mô tả chỉnh sửa của bạn, và để AI làm phần còn lại.';
            editorContent = (
                <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-6 bg-white dark:bg-slate-800/50 p-6 rounded-2xl shadow-lg">
                        <MultiImageUploadPanel
                            title="1. Tải lên ảnh của bạn"
                            images={customImages}
                            onUpload={handleCustomImagesUpload}
                            onRemove={removeCustomImage}
                            inputId="custom-image-upload"
                        />
                        <div>
                            <label htmlFor="prompt" className="block text-sm font-medium text-slate-700 dark:text-slate-300">2. Mô tả chỉnh sửa của bạn</label>
                            <textarea
                                id="prompt"
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                rows={3}
                                className="mt-1 block w-full rounded-md bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                                placeholder="ví dụ: thêm một chiếc mũ sinh nhật cho con mèo"
                            />
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">Cạn ý tưởng? Thử một concept:</h3>
                            <div className="mt-2 flex flex-wrap gap-2">
                                {conceptPrompts.map(p => (
                                    <button key={p} onClick={() => setPrompt(p)} className="px-3 py-1 text-sm bg-slate-100 dark:bg-slate-700 rounded-full hover:bg-purple-100 dark:hover:bg-purple-900/50 hover:text-purple-700 dark:hover:text-purple-300 transition-colors">
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <button
                            onClick={handleGenerate}
                            disabled={isLoading || customImages.length === 0 || !prompt}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-slate-400 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Đang tạo...' : 'Tạo ảnh'}
                        </button>
                    </div>
                    <div className="bg-white dark:bg-slate-800/50 p-6 rounded-2xl shadow-lg flex flex-col justify-between">
                        {resultDisplay}
                        {generatedImage && (
                             <a 
                                href={`data:${generatedImage.mimeType};base64,${generatedImage.data}`} 
                                download={`lensy-studio-${Date.now()}.png`}
                                className="mt-4 w-full inline-block text-center bg-emerald-400 text-emerald-900 font-bold py-3 px-6 rounded-full hover:bg-emerald-500 transition-colors"
                            >
                                Tải ảnh về
                            </a>
                        )}
                    </div>
                </div>
            );
        } else if (activeFeature === 'virtual-kol') {
            title = 'Tạo KOL ảo';
            description = 'Tải lên một hình minh hoạ 2D và biến nó thành 4 phiên bản người mẫu 3D siêu thực.';
            editorContent = (
                <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-6 bg-white dark:bg-slate-800/50 p-6 rounded-2xl shadow-lg flex flex-col">
                        {singleUploadPanel('Tải lên ảnh mẫu', virtualKolImage, handleVirtualKolImageUpload, 'virtual-kol-upload')}
                        
                        <div className="flex-grow">
                            <label htmlFor="kol-prompt" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Nhập yêu cầu KOL</label>
                            <textarea
                                id="kol-prompt"
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                rows={4}
                                className="mt-1 block w-full rounded-md bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                                placeholder="ví dụ: phong cách cyberpunk, mặc áo khoác da, đứng trong thành phố ban đêm..."
                            />
                        </div>
                        <button
                            onClick={handleCreateVirtualKol}
                            disabled={isLoading || !virtualKolImage}
                            className="w-full mt-4 flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-slate-400 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Đang tạo...' : 'Tạo KOL ngay'}
                        </button>
                    </div>
                     <div className="bg-white dark:bg-slate-800/50 p-6 rounded-2xl shadow-lg flex flex-col justify-between">
                        {isLoading && generatedVirtualKolImages.length === 0 && <Spinner />}
                        {error && <p className="text-red-500 text-center">{error}</p>}
                        
                        {generatedVirtualKolImages.length > 0 && (
                            <div className="flex-grow flex flex-col">
                                <div className="grid grid-cols-2 gap-4">
                                    {generatedVirtualKolImages.map((image, index) => (
                                        <button 
                                            key={index} 
                                            onClick={() => setSelectedVirtualKolImage(image)}
                                            className={`rounded-lg overflow-hidden transition-all duration-200 aspect-w-1 aspect-h-1 ${selectedVirtualKolImage === image ? 'ring-4 ring-offset-2 dark:ring-offset-slate-800 ring-purple-500' : 'hover:opacity-80'}`}
                                        >
                                            <img 
                                                src={`data:${image.mimeType};base64,${image.data}`} 
                                                alt={`Virtual KOL result ${index + 1}`} 
                                                className="w-full h-full object-cover"
                                            />
                                        </button>
                                    ))}
                                    {isLoading && (
                                        <div className="rounded-lg bg-slate-100 dark:bg-slate-900 flex items-center justify-center aspect-w-1 aspect-h-1">
                                            <Spinner />
                                        </div>
                                    )}
                                </div>
                            </div>
                        )} 
                        
                        {!isLoading && !error && generatedVirtualKolImages.length === 0 && (
                           <div className="text-center text-slate-500 dark:text-slate-400 flex flex-col justify-center items-center h-full">
                               <UserPlusIcon className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600" />
                               <p className="mt-2">4 phiên bản KOL sẽ xuất hiện ở đây.</p>
                           </div>
                        )}

                        {generatedVirtualKolImages.length > 0 && (
                            <DownloadSection
                                generatedImage={selectedVirtualKolImage}
                                downloadQuality={downloadQuality}
                                setDownloadQuality={setDownloadQuality}
                                fileNamePrefix="virtual-kol"
                            />
                        )}
                    </div>
                </div>
            );
        } else if (activeFeature === 'concept-photoshoot') {
            title = 'Chụp ảnh theo concept';
            description = 'Biến ảnh của bạn thành một bộ ảnh nghệ thuật theo chủ đề bạn chọn.';
            const concepts = ['Tổng tài', 'Cảnh sát', 'Ảnh trung thu', 'Ảnh săn mây', 'Phi hành gia', 'Cổ trang', 'Cyberpunk', 'Vintage'];
            editorContent = (
                <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-6 bg-white dark:bg-slate-800/50 p-6 rounded-2xl shadow-lg flex flex-col">
                        {singleUploadPanel('1. Tải lên ảnh của bạn', conceptImage, handleConceptImageUpload, 'concept-upload')}
                        
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">2. Chọn Concept</label>
                            <div className="relative">
                                <div className="flex space-x-3 overflow-x-auto pb-2">
                                    {concepts.map(concept => (
                                        <button
                                            key={concept}
                                            onClick={() => setSelectedConcept(concept)}
                                            className={`flex-shrink-0 px-4 py-2 text-sm font-semibold rounded-full transition-all duration-200 border-2 ${
                                                selectedConcept === concept 
                                                ? 'bg-purple-600 text-white border-purple-600' 
                                                : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600 hover:border-purple-500'
                                            }`}
                                        >
                                            {concept}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex-grow">
                            <label htmlFor="concept-prompt" className="block text-sm font-medium text-slate-700 dark:text-slate-300">3. Nhập mô tả (Tuỳ chọn)</label>
                            <textarea
                                id="concept-prompt"
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                rows={3}
                                className="mt-1 block w-full rounded-md bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                                placeholder="ví dụ: mặc vest đen, ngồi trong văn phòng sang trọng..."
                            />
                        </div>
                        <button
                            onClick={handleCreateConceptPhotoshoot}
                            disabled={isLoading || !conceptImage || !selectedConcept}
                            className="w-full mt-4 flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-slate-400 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Đang tạo...' : 'Tạo concept'}
                        </button>
                    </div>
                     <div className="bg-white dark:bg-slate-800/50 p-6 rounded-2xl shadow-lg flex flex-col justify-between">
                        {isLoading && generatedConceptImages.length === 0 && <Spinner />}
                        {error && <p className="text-red-500 text-center">{error}</p>}
                        
                        {generatedConceptImages.length > 0 && (
                            <div className="flex-grow flex flex-col">
                                <div className="grid grid-cols-2 gap-4">
                                    {generatedConceptImages.map((image, index) => (
                                        <button 
                                            key={index} 
                                            onClick={() => setSelectedConceptImage(image)}
                                            className={`rounded-lg overflow-hidden transition-all duration-200 aspect-w-1 aspect-h-1 ${selectedConceptImage === image ? 'ring-4 ring-offset-2 dark:ring-offset-slate-800 ring-purple-500' : 'hover:opacity-80'}`}
                                        >
                                            <img 
                                                src={`data:${image.mimeType};base64,${image.data}`} 
                                                alt={`Concept result ${index + 1}`} 
                                                className="w-full h-full object-cover"
                                            />
                                        </button>
                                    ))}
                                    {isLoading && generatedConceptImages.length < 4 && (
                                        <div className="rounded-lg bg-slate-100 dark:bg-slate-900 flex items-center justify-center aspect-w-1 aspect-h-1">
                                            <Spinner />
                                        </div>
                                    )}
                                </div>
                            </div>
                        )} 
                        
                        {!isLoading && !error && generatedConceptImages.length === 0 && (
                           <div className="text-center text-slate-500 dark:text-slate-400 flex flex-col justify-center items-center h-full">
                               <SparklesIcon className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600" />
                               <p className="mt-2">4 phiên bản concept sẽ xuất hiện ở đây.</p>
                           </div>
                        )}

                        {generatedConceptImages.length > 0 && (
                            <DownloadSection
                                generatedImage={selectedConceptImage}
                                downloadQuality={downloadQuality}
                                setDownloadQuality={setDownloadQuality}
                                fileNamePrefix="concept"
                            />
                        )}
                    </div>
                </div>
            );
        } else if (activeFeature === 'remove-background') {
            title = 'Xoá nền';
            description = 'Tải ảnh lên để tự động xoá nền và làm cho nó trong suốt.';
            editorContent = (
                <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-6 bg-white dark:bg-slate-800/50 p-6 rounded-2xl shadow-lg flex flex-col justify-between">
                        {singleUploadPanel('Tải lên hoặc kéo thả file muốn xoá nền vào', baseImage, handleBaseImageUpload, 'file-upload')}
                        <button
                            onClick={handleRemoveBackground}
                            disabled={isLoading || !baseImage}
                            className="w-full sm:w-auto flex justify-center py-3 px-8 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-slate-400 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Đang xử lý...' : 'Bắt đầu xoá nền'}
                        </button>
                    </div>
                    <div className="bg-white dark:bg-slate-800/50 p-6 rounded-2xl shadow-lg flex flex-col justify-between">
                        {resultDisplay}
                        {generatedImage && (
                             <a 
                                href={`data:${generatedImage.mimeType};base64,${generatedImage.data}`} 
                                download={`lensy-removebg-${Date.now()}.png`}
                                className="mt-4 w-full inline-block text-center bg-emerald-400 text-emerald-900 font-bold py-3 px-6 rounded-full hover:bg-emerald-500 transition-colors"
                            >
                                Tải ảnh về
                            </a>
                        )}
                    </div>
                </div>
            )
        } else if (activeFeature === 'face-swap') {
            title = 'Đổi mặt';
            description = 'Tải lên ảnh người mẫu và ảnh khuôn mặt của bạn để hoán đổi chúng.';
            const FaceSwapUploadPanel: React.FC<{ title: string; image: { preview: string } | null; onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void; id: string; }> = ({ title, image, onUpload, id }) => (
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{title}</label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 dark:border-slate-600 border-dashed rounded-md">
                        <div className="space-y-1 text-center">
                            {image ? (
                                <img src={image.preview} alt="Preview" className="mx-auto h-24 w-auto rounded-lg" />
                            ) : (
                                <PhotoIcon className="mx-auto h-12 w-12 text-slate-400" />
                            )}
                            <div className="flex text-sm text-slate-600 dark:text-slate-400">
                                <label htmlFor={id} className="relative cursor-pointer bg-white dark:bg-slate-800 rounded-md font-medium text-purple-600 hover:text-purple-500 dark:text-purple-400 dark:hover:text-purple-300 focus-within:outline-none">
                                    <span>{image ? 'Thay đổi ảnh' : 'Tải lên ảnh'}</span>
                                    <input id={id} name={id} type="file" className="sr-only" accept="image/*" onChange={onUpload} />
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            );

            editorContent = (
                <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-6 bg-white dark:bg-slate-800/50 p-6 rounded-2xl shadow-lg">
                        <FaceSwapUploadPanel title="1. Tải lên ảnh người mẫu" image={baseImage} onUpload={handleBaseImageUpload} id="base-image-upload" />
                        <FaceSwapUploadPanel title="2. Tải lên ảnh mặt của bạn" image={faceImage} onUpload={handleFaceImageUpload} id="face-image-upload" />
                        
                        <button
                            onClick={handleFaceSwap}
                            disabled={isLoading || !baseImage || !faceImage}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-slate-400 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Đang thay đổi...' : 'Bắt đầu thay đổi'}
                        </button>
                    </div>
                    <div className="bg-white dark:bg-slate-800/50 p-6 rounded-2xl shadow-lg flex flex-col justify-between">
                        {resultDisplay}
                        {generatedImage && (
                            <DownloadSection
                                generatedImage={generatedImage}
                                downloadQuality={downloadQuality}
                                setDownloadQuality={setDownloadQuality}
                                fileNamePrefix="faceswap"
                            />
                        )}
                    </div>
                </div>
            );
        } else if (activeFeature === 'poster-creation') {
            title = 'Tạo Poster';
            description = 'Tải lên các thành phần ảnh, mô tả ý tưởng và để AI tạo ra một poster độc đáo.';
            
            editorContent = (
                <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-6 bg-white dark:bg-slate-800/50 p-6 rounded-2xl shadow-lg">
                        <MultiImageUploadPanel
                            title="1. Tải lên các thành phần ảnh"
                            images={posterImages}
                            onUpload={handlePosterImageUpload}
                            onRemove={removePosterImage}
                            inputId="poster-image-upload"
                        />
                        <div>
                            <label htmlFor="poster-prompt" className="block text-sm font-medium text-slate-700 dark:text-slate-300">2. Nhập ý tưởng poster muốn tạo</label>
                            <textarea
                                id="poster-prompt"
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                rows={4}
                                className="mt-1 block w-full rounded-md bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                                placeholder="ví dụ: Poster phim hành động, tiêu đề 'CYBERPUNK EDGE', với nhân vật chính ở giữa, nền là thành phố neon vào ban đêm."
                            />
                        </div>
                        <button
                            onClick={handleCreatePoster}
                            disabled={isLoading || posterImages.length === 0 || !prompt}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-slate-400 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Đang tạo...' : 'Tạo poster ngay'}
                        </button>
                    </div>
                     <div className="bg-white dark:bg-slate-800/50 p-6 rounded-2xl shadow-lg flex flex-col justify-between">
                        {resultDisplay}
                        {generatedImage && (
                            <DownloadSection
                                generatedImage={generatedImage}
                                downloadQuality={downloadQuality}
                                setDownloadQuality={setDownloadQuality}
                                fileNamePrefix="poster"
                            />
                        )}
                    </div>
                </div>
            );
        } else if (activeFeature === 'restore-old-photo') {
            title = 'Phục hồi ảnh cũ';
            description = 'Tải ảnh lên, tùy chọn thêm yêu cầu, và để AI khôi phục lại kỷ niệm của bạn.';
            editorContent = (
                <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-6 bg-white dark:bg-slate-800/50 p-6 rounded-2xl shadow-lg">
                        {singleUploadPanel('Tải ảnh cần Phục hồi', oldPhotoImage, handleOldPhotoImageUpload, 'old-photo-upload')}
                        <div>
                            <label htmlFor="prompt" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Yêu cầu (tuỳ chọn)</label>
                            <textarea
                                id="prompt"
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                rows={3}
                                className="mt-1 block w-full rounded-md bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                                placeholder="ví dụ: giữ nguyên ảnh đen trắng, chỉ phục hồi hư hỏng"
                            />
                        </div>
                        <button
                            onClick={handleRestoreOldPhoto}
                            disabled={isLoading || !oldPhotoImage}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-slate-400 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Đang phục hồi...' : 'Bắt đầu phục hồi'}
                        </button>
                    </div>
                    <div className="bg-white dark:bg-slate-800/50 p-6 rounded-2xl shadow-lg flex flex-col justify-between">
                        {resultDisplay}
                        {generatedImage && (
                            <DownloadSection
                                generatedImage={generatedImage}
                                downloadQuality={downloadQuality}
                                setDownloadQuality={setDownloadQuality}
                                fileNamePrefix="restored"
                            />
                        )}
                    </div>
                </div>
            );
        } else if (activeFeature === 'online-try-on') {
            title = 'Thử đồ online';
            description = 'Tải ảnh người mẫu và các món đồ để xem chúng kết hợp với nhau như thế nào.';

            const createImageRemoveHandler = (setter: React.Dispatch<React.SetStateAction<{ file: File; preview: string; mimeType: string; } | null>>) => () => {
                setter(null);
            };

            const TryOnUploadPanel: React.FC<{
                title: string;
                image: { preview: string } | null;
                onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
                onRemove: () => void;
                id: string;
                isMain?: boolean;
            }> = ({ title, image, onUpload, onRemove, id, isMain = false }) => (
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{title}</label>
                    <div className={`relative mt-1 flex justify-center items-center p-2 border-2 border-slate-300 dark:border-slate-600 border-dashed rounded-md ${isMain ? 'min-h-[200px]' : 'min-h-[100px]'}`}>
                        {image ? (
                            <>
                                <img src={image.preview} alt="Preview" className={`object-contain rounded-lg ${isMain ? 'max-h-64' : 'max-h-24'}`} />
                                <button onClick={onRemove} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors" aria-label={`Remove ${title}`}>
                                    <XIcon className="w-3 h-3" />
                                </button>
                            </>
                        ) : (
                            <div className="space-y-1 text-center">
                                 <div className="flex text-sm text-slate-600 dark:text-slate-400">
                                    <label htmlFor={id} className="relative cursor-pointer bg-white dark:bg-slate-800 rounded-md font-medium text-purple-600 hover:text-purple-500 dark:text-purple-400 dark:hover:text-purple-300 focus-within:outline-none p-2">
                                        <span>Tải lên</span>
                                        <input id={id} name={id} type="file" className="sr-only" accept="image/*" onChange={onUpload} />
                                    </label>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            );

            editorContent = (
                <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-4 bg-white dark:bg-slate-800/50 p-6 rounded-2xl shadow-lg">
                        <TryOnUploadPanel title="Ảnh toàn thân người mẫu" image={onlineTryOnModel} onUpload={handleOnlineTryOnModelUpload} onRemove={createImageRemoveHandler(setOnlineTryOnModel)} id="model-upload" isMain />
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            <TryOnUploadPanel title="Kiểu tóc" image={onlineTryOnHair} onUpload={handleOnlineTryOnHairUpload} onRemove={createImageRemoveHandler(setOnlineTryOnHair)} id="hair-upload" />
                            <TryOnUploadPanel title="Áo/Váy" image={onlineTryOnTop} onUpload={handleOnlineTryOnTopUpload} onRemove={createImageRemoveHandler(setOnlineTryOnTop)} id="top-upload" />
                            <TryOnUploadPanel title="Quần" image={onlineTryOnPants} onUpload={handleOnlineTryOnPantsUpload} onRemove={createImageRemoveHandler(setOnlineTryOnPants)} id="pants-upload" />
                            <TryOnUploadPanel title="Giày/Dép" image={onlineTryOnShoes} onUpload={handleOnlineTryOnShoesUpload} onRemove={createImageRemoveHandler(setOnlineTryOnShoes)} id="shoes-upload" />
                            <TryOnUploadPanel title="Phụ kiện" image={onlineTryOnAccessory} onUpload={handleOnlineTryOnAccessoryUpload} onRemove={createImageRemoveHandler(setOnlineTryOnAccessory)} id="accessory-upload" />
                        </div>
                        <div>
                             <label htmlFor="prompt" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Yêu cầu (Tùy chọn)</label>
                             <textarea
                                id="prompt"
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                rows={2}
                                className="mt-1 block w-full rounded-md bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                                placeholder="ví dụ: cho áo vào trong quần, thay đổi màu nền..."
                            />
                        </div>
                        <button
                            onClick={handleOnlineTryOn}
                            disabled={isLoading || !onlineTryOnModel}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-slate-400 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Đang xử lý...' : 'Bắt đầu thử đồ'}
                        </button>
                    </div>
                    <div className="bg-white dark:bg-slate-800/50 p-6 rounded-2xl shadow-lg flex flex-col justify-between">
                        {resultDisplay}
                        {generatedImage && (
                             <DownloadSection
                                generatedImage={generatedImage}
                                downloadQuality={downloadQuality}
                                setDownloadQuality={setDownloadQuality}
                                fileNamePrefix="tryon"
                            />
                        )}
                    </div>
                </div>
            );
        } else if (activeFeature === 'sales-kol') {
            title = 'Tạo KOL Bán Hàng';
            description = 'Tải lên ảnh KOL, ảnh sản phẩm, và để AI tạo ra một bức ảnh quảng cáo chuyên nghiệp.';
            
            editorContent = (
                <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-6 bg-white dark:bg-slate-800/50 p-6 rounded-2xl shadow-lg">
                        {singleUploadPanel('1. Tải lên ảnh KOL', kolImage, handleKolImageUpload, 'kol-image-upload')}
                        
                        <MultiImageUploadPanel
                            title="2. Tải lên ảnh sản phẩm"
                            images={productImages}
                            onUpload={handleProductImagesUpload}
                            onRemove={removeProductImage}
                            inputId="product-image-upload"
                        />

                        <div>
                            <label htmlFor="kol-prompt" className="block text-sm font-medium text-slate-700 dark:text-slate-300">3. Nhập yêu cầu (Tuỳ chọn)</label>
                            <textarea
                                id="kol-prompt"
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                rows={3}
                                className="mt-1 block w-full rounded-md bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                                placeholder="ví dụ: KOL đang ngồi trên ghế sofa, cầm túi xách, nền là một căn phòng sang trọng."
                            />
                        </div>
                        <button
                            onClick={handleCreateSalesKol}
                            disabled={isLoading || !kolImage || productImages.length === 0}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-slate-400 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Đang tạo...' : 'Tạo ảnh'}
                        </button>
                    </div>
                     <div className="bg-white dark:bg-slate-800/50 p-6 rounded-2xl shadow-lg flex flex-col justify-between">
                        {resultDisplay}
                        {generatedImage && (
                            <DownloadSection
                                generatedImage={generatedImage}
                                downloadQuality={downloadQuality}
                                setDownloadQuality={setDownloadQuality}
                                fileNamePrefix="sales-kol"
                            />
                        )}
                    </div>
                </div>
            );
        } else if (activeFeature === 'wedding-photoshoot') {
            title = 'Chụp ảnh cưới';
            description = 'Tạo ra những bức ảnh cưới đẹp như mơ, giữ lại đúng khuôn mặt của bạn và người ấy.';
            editorContent = (
                <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-6 bg-white dark:bg-slate-800/50 p-6 rounded-2xl shadow-lg">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {singleUploadPanel('Tải lên ảnh chú rể', groomImage, handleGroomImageUpload, 'groom-upload')}
                            {singleUploadPanel('Tải lên ảnh cô dâu', brideImage, handleBrideImageUpload, 'bride-upload')}
                        </div>
                        
                        <MultiImageUploadPanel
                            title="Tải lên concept ảnh cưới (Tuỳ chọn)"
                            images={weddingConceptImages}
                            onUpload={handleWeddingConceptImagesUpload}
                            onRemove={removeWeddingConceptImage}
                            inputId="wedding-concept-upload"
                        />

                        <div>
                            <label htmlFor="wedding-prompt" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Nhập yêu cầu (Tuỳ chọn)</label>
                            <textarea
                                id="wedding-prompt"
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                rows={3}
                                className="mt-1 block w-full rounded-md bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                                placeholder="ví dụ: bối cảnh hoàng hôn trên bãi biển, phong cách Hàn Quốc..."
                            />
                        </div>
                        <button
                            onClick={handleCreateWeddingPhotoshoot}
                            disabled={isLoading || !groomImage || !brideImage}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-slate-400 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Đang tạo...' : 'Bắt đầu ngay'}
                        </button>
                    </div>
                     <div className="bg-white dark:bg-slate-800/50 p-6 rounded-2xl shadow-lg flex flex-col justify-between">
                        {isLoading && generatedWeddingImages.length === 0 && <Spinner />}
                        {error && <p className="text-red-500 text-center">{error}</p>}
                        
                        {generatedWeddingImages.length > 0 && (
                            <div className="flex-grow flex flex-col">
                                <div className="flex-shrink-0 mb-4 h-64 sm:h-80 md:h-96 w-full bg-slate-100 dark:bg-slate-900 rounded-lg flex items-center justify-center">
                                    {selectedWeddingImage && (
                                        <img 
                                            src={`data:${selectedWeddingImage.mimeType};base64,${selectedWeddingImage.data}`} 
                                            alt="Selected wedding photo" 
                                            className="max-w-full max-h-full object-contain rounded-md"
                                        />
                                    )}
                                </div>
                                <p className="text-center text-sm text-slate-500 mb-2">Bộ sưu tập ({generatedWeddingImages.length} ảnh được tạo). Chọn ảnh để xem và tải về.</p>
                                <div className="grid grid-cols-5 gap-2">
                                    {generatedWeddingImages.map((image, index) => (
                                        <button 
                                            key={index} 
                                            onClick={() => setSelectedWeddingImage(image)}
                                            className={`rounded-md overflow-hidden transition-all duration-200 aspect-square ${selectedWeddingImage === image ? 'ring-2 ring-purple-500' : 'hover:opacity-80'}`}
                                        >
                                            <img 
                                                src={`data:${image.mimeType};base64,${image.data}`} 
                                                alt={`Wedding result ${index + 1}`} 
                                                className="w-full h-full object-cover"
                                            />
                                        </button>
                                    ))}
                                    {isLoading && (
                                        <div className="rounded-md bg-slate-100 dark:bg-slate-900 flex items-center justify-center aspect-square">
                                            <Spinner />
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                        
                        {!isLoading && !error && generatedWeddingImages.length === 0 && (
                           resultDisplay
                        )}

                        {generatedWeddingImages.length > 0 && (
                            <DownloadSection
                                generatedImage={selectedWeddingImage}
                                downloadQuality={downloadQuality}
                                setDownloadQuality={setDownloadQuality}
                                fileNamePrefix="wedding"
                            />
                        )}
                    </div>
                </div>
            );
        }

        return (
            <div>
                <button
                    onClick={() => setActiveFeature(null)}
                    className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-purple-600 dark:text-slate-400 dark:hover:text-purple-400 transition-colors duration-200"
                >
                    <ChevronLeftIcon className="w-5 h-5" />
                    Quay lại Tất cả tính năng
                </button>

                <div className="text-center">
                     <h2 className="text-3xl font-extrabold tracking-tight">{title}</h2>
                     <p className="mt-2 text-lg text-slate-500 dark:text-slate-400">{description}</p>
                </div>
                
                {editorContent}

                {history.length > 0 && (
                    <div className="mt-12">
                        <h2 className="text-2xl font-bold text-center mb-6">Các tác phẩm gần đây của bạn</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {history.map(item => (
                                <div key={item.id} className="group relative rounded-lg overflow-hidden shadow-lg cursor-pointer">
                                    <img src={`data:${item.thumbnail.mimeType};base64,${item.thumbnail.data}`} alt={item.prompt} className="w-full h-full object-cover aspect-square"/>
                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 flex items-center justify-center p-2">
                                        <p className="text-white text-xs text-center opacity-0 group-hover:opacity-100 transition-opacity">{item.prompt}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className="space-y-12">
            <ApiKeyModal 
                isOpen={isApiKeyModalOpen} 
                onClose={() => setIsApiKeyModalOpen(false)}
                onNavigate={handleNavigateToSettings}
            />
            <div className="text-center pt-8">
                <h1 className="text-4xl font-extrabold tracking-tight">Studio sáng tạo Lensy</h1>
                <p className="mt-2 text-lg text-slate-500 dark:text-slate-400">Chọn một tính năng hoặc bắt đầu tuỳ chỉnh sáng tạo của bạn bên dưới.</p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-8">
                {features.map(feature => (
                  <FeatureCard
                    key={feature.title}
                    icon={feature.icon}
                    title={feature.title}
                    description={feature.description}
                    onTryNow={() => handleFeatureSelect(feature.title)}
                  />
                ))}
            </div>
        </div>
    );
};

export default StudioPage;
