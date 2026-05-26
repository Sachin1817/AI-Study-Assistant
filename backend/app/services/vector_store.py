import logging
from typing import List, Dict, Any, Optional
import numpy as np
from openai import OpenAI
from app.config import settings
from app.database import get_collection

logger = logging.getLogger("vector_store")

# Initialize OpenAI client using the user's provided OpenAI API Key
openai_client = None
try:
    if settings.OPENAI_API_KEY:
        openai_client = OpenAI(api_key=settings.OPENAI_API_KEY)
        logger.info("OpenAI client configured for vector embeddings.")
except Exception as e:
    logger.error(f"Error configuring OpenAI client: {e}")

def get_embedding(text: str) -> Optional[List[float]]:
    """
    Generates a high-fidelity vector embedding using OpenAI's modern text-embedding-3-small model.
    """
    if not openai_client:
        logger.warning("OpenAI client not configured. Embeddings search will fall back to TF-IDF matching.")
        return None
        
    try:
        # Standard lightweight embedding model
        response = openai_client.embeddings.create(
            input=[text.replace("\n", " ")],
            model="text-embedding-3-small"
        )
        return response.data[0].embedding
    except Exception as e:
        logger.error(f"OpenAI embedding generation failed: {e}")
        return None

def store_pdf_embeddings(pdf_id: str, chunks: List[Dict[str, Any]]) -> bool:
    """
    Generates and saves embeddings for all chunks of a PDF.
    Save destinations include the MongoDB 'embeddings' collection.
    """
    if not chunks:
        return False

    embeddings_col = get_collection("embeddings")
    embedded_chunks = []
    
    logger.info(f"Generating embeddings for {len(chunks)} chunks of PDF: {pdf_id}")
    
    for chunk in chunks:
        vector = get_embedding(chunk["text"])
        if vector:
            embedded_chunks.append({
                "pdf_id": pdf_id,
                "chunk_id": chunk["chunk_id"],
                "text": chunk["text"],
                "vector": vector
            })
            
    if embedded_chunks:
        try:
            for item in embedded_chunks:
                embeddings_col.insert_one(item)
            logger.info(f"Successfully saved {len(embedded_chunks)} vector records to database.")
            return True
        except Exception as db_err:
            logger.error(f"Failed to store vector records in DB: {db_err}")
            return False
            
    return False

def search_similar_chunks(pdf_id: str, query: str, top_k: int = 3) -> str:
    """
    Retrieves the most semantically relevant text chunks using cosine similarity.
    Falls back to basic substring keyword scoring if OpenAI embeddings are unavailable.
    """
    embeddings_col = get_collection("embeddings")
    
    # Retrieve all chunks belonging to this PDF
    cursor = embeddings_col.find({"pdf_id": pdf_id})
    db_items = list(cursor)
    
    if not db_items:
        logger.warning(f"No indexed embeddings found in database for PDF: {pdf_id}. Running direct text fallback.")
        # Fall back to standard pdf text chunks
        pdfs_col = get_collection("pdfs")
        pdf = pdfs_col.find_one({"_id": pdf_id})
        if pdf and "chunks" in pdf:
            # Match keywords
            matched_chunks = []
            keywords = query.lower().split()
            for chunk in pdf["chunks"]:
                score = sum(1 for kw in keywords if kw in chunk["text"].lower())
                matched_chunks.append((score, chunk["text"]))
            matched_chunks.sort(key=lambda x: x[0], reverse=True)
            return "\n\n".join([chunk[1] for chunk in matched_chunks[:top_k]])
        return ""

    query_vector = get_embedding(query)
    
    # Cosine Similarity Embedding Search
    if query_vector:
        try:
            similarities = []
            q_vec = np.array(query_vector)
            
            for item in db_items:
                chunk_vector = item.get("vector")
                if chunk_vector:
                    c_vec = np.array(chunk_vector)
                    # Standard cosine similarity formula
                    cosine_sim = np.dot(q_vec, c_vec) / (np.linalg.norm(q_vec) * np.linalg.norm(c_vec))
                    similarities.append((cosine_sim, item["text"]))
            
            # Sort descending by score
            similarities.sort(key=lambda x: x[0], reverse=True)
            relevant_texts = [item[1] for item in similarities[:top_k]]
            logger.info(f"RAG embedding search completed. Top score: {similarities[0][0] if similarities else 0.0}")
            return "\n\n".join(relevant_texts)
        except Exception as calc_err:
            logger.error(f"Cosine similarity calculations failed: {calc_err}")
            
    # Text-matching backup fallback
    logger.info("Using text keyword match fallback...")
    matched_chunks = []
    keywords = query.lower().split()
    for item in db_items:
        score = sum(1 for kw in keywords if kw in item["text"].lower())
        matched_chunks.append((score, item["text"]))
    matched_chunks.sort(key=lambda x: x[0], reverse=True)
    return "\n\n".join([chunk[1] for chunk in matched_chunks[:top_k]])
